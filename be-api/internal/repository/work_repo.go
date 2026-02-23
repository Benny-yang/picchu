package repository

import (
	"azure-magnetar/internal/model"
	"fmt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// WorkRepository defines the interface for work/post-related database operations.
type WorkRepository interface {
	Create(post *model.Post) error
	GetByID(id uint, currentUserID uint) (*model.Post, error)
	Update(post *model.Post) error
	Delete(id uint) error
	GetByUserID(userID uint) ([]model.Post, error)
	GetPosts(offset, limit int, seed int64, filterType string, currentUserID uint) ([]model.Post, int64, error)
	IncrementLikeCount(workID uint) error
	DecrementLikeCount(workID uint) error
	IncrementCommentCount(workID uint) error
	DecrementCommentCount(workID uint) error
	GetTagsByNames(names []string) ([]model.Tag, error)
}

type workRepository struct {
	db *gorm.DB
}

// NewWorkRepository creates a new WorkRepository.
func NewWorkRepository(db *gorm.DB) WorkRepository {
	return &workRepository{db: db}
}

// syncTags ensures tags exist and associates them with the post.
func (r *workRepository) syncTags(tx *gorm.DB, post *model.Post, tags []model.Tag) error {
	if len(tags) == 0 {
		return tx.Model(post).Association("Tags").Clear()
	}

	// 1. Upsert Tags (ignore if name already exists)
	if err := tx.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "name"}},
		DoNothing: true,
	}).Create(&tags).Error; err != nil {
		return err
	}

	// 2. Fetch the actual IDs for these tags
	var names []string
	for _, t := range tags {
		names = append(names, t.Name)
	}
	var existingTags []model.Tag
	if err := tx.Where("name IN ?", names).Find(&existingTags).Error; err != nil {
		return err
	}

	// 3. Replace associations
	return tx.Model(post).Association("Tags").Replace(existingTags)
}

func (r *workRepository) Create(post *model.Post) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Save the post without tags first to avoid unique constraint issues
		if err := tx.Omit("Tags").Create(post).Error; err != nil {
			return err
		}
		// Then sync the tags
		return r.syncTags(tx, post, post.Tags)
	})
}

func (r *workRepository) GetByID(id uint, currentUserID uint) (*model.Post, error) {
	var post model.Post
	if err := r.db.Preload("Author").Preload("Author.Profile").Preload("Tags").First(&post, id).Error; err != nil {
		return nil, err
	}

	if currentUserID > 0 {
		var count int64
		r.db.Model(&model.Like{}).Where("user_id = ? AND work_id = ?", currentUserID, id).Count(&count)
		post.IsLiked = count > 0
	}

	return &post, nil
}

func (r *workRepository) Update(post *model.Post) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Omit("Tags").Save(post).Error; err != nil {
			return err
		}
		return r.syncTags(tx, post, post.Tags)
	})
}

func (r *workRepository) Delete(id uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var post model.Post
		post.ID = id

		// Clear many-to-many relationships (post_tags)
		if err := tx.Model(&post).Association("Tags").Clear(); err != nil {
			return err
		}

		// Delete all likes for this post
		if err := tx.Where("work_id = ?", id).Delete(&model.Like{}).Error; err != nil {
			return err
		}

		// Delete all comments for this post
		if err := tx.Where("work_id = ?", id).Delete(&model.Comment{}).Error; err != nil {
			return err
		}

		// Delete the post itself
		return tx.Delete(&model.Post{}, id).Error
	})
}

func (r *workRepository) GetByUserID(userID uint) ([]model.Post, error) {
	var posts []model.Post
	err := r.db.Preload("Author").Preload("Author.Profile").Preload("Tags").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&posts).Error
	return posts, err
}

func (r *workRepository) GetPosts(offset, limit int, seed int64, filterType string, currentUserID uint) ([]model.Post, int64, error) {
	var posts []model.Post
	var total int64

	randSeed := fmt.Sprintf("RAND(%d)", seed)
	query := r.db.Model(&model.Post{}).Preload("Author").Preload("Author.Profile").Preload("Tags")

	if filterType == "following" && currentUserID > 0 {
		query = query.Joins("JOIN follows ON follows.following_id = posts.user_id").
			Where("follows.follower_id = ?", currentUserID)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Order(gorm.Expr(randSeed)).
		Offset(offset).
		Limit(limit).
		Find(&posts).Error; err != nil {
		return nil, 0, err
	}

	if currentUserID > 0 && len(posts) > 0 {
		var likedWorkIDs []uint
		workIDs := make([]uint, len(posts))
		for i, p := range posts {
			workIDs[i] = p.ID
		}

		r.db.Model(&model.Like{}).
			Where("user_id = ? AND work_id IN ?", currentUserID, workIDs).
			Pluck("work_id", &likedWorkIDs)

		likedMap := make(map[uint]bool)
		for _, id := range likedWorkIDs {
			likedMap[id] = true
		}

		for i := range posts {
			posts[i].IsLiked = likedMap[posts[i].ID]
		}
	}

	return posts, total, nil
}

func (r *workRepository) IncrementLikeCount(workID uint) error {
	return r.db.Model(&model.Post{}).
		Where("id = ?", workID).
		UpdateColumn("like_count", gorm.Expr("like_count + 1")).Error
}

func (r *workRepository) DecrementLikeCount(workID uint) error {
	return r.db.Model(&model.Post{}).
		Where("id = ? AND like_count > 0", workID).
		UpdateColumn("like_count", gorm.Expr("like_count - 1")).Error
}

func (r *workRepository) IncrementCommentCount(workID uint) error {
	return r.db.Model(&model.Post{}).
		Where("id = ?", workID).
		UpdateColumn("comment_count", gorm.Expr("comment_count + 1")).Error
}

func (r *workRepository) DecrementCommentCount(workID uint) error {
	return r.db.Model(&model.Post{}).
		Where("id = ? AND comment_count > 0", workID).
		UpdateColumn("comment_count", gorm.Expr("comment_count - 1")).Error
}

func (r *workRepository) GetTagsByNames(names []string) ([]model.Tag, error) {
	var tags []model.Tag
	if len(names) == 0 {
		return tags, nil
	}
	err := r.db.Where("name IN ?", names).Find(&tags).Error
	return tags, err
}
