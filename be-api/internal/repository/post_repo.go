package repository

import (
	"azure-magnetar/internal/model"
	"fmt"

	"gorm.io/gorm"
)

type PostRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) *PostRepository {
	return &PostRepository{db: db}
}

// GetPosts retrieves posts based on filter type (trending/following)
// For Trending: Uses ORDER BY RAND(seed) with LIMIT/OFFSET
// For Following: Joins with follows table
func (r *PostRepository) GetPosts(offset int, limit int, seed int64, filterType string, currentUserID uint) ([]model.Post, int64, error) {
	var posts []model.Post
	var total int64

	// Create seed string for MySQL RAND(N)
	// Note: RAND(N) in MySQL produces a repeatable sequence for a given N
	randSeed := fmt.Sprintf("RAND(%d)", seed)

	query := r.db.Model(&model.Post{}).Preload("Author")

	if filterType == "following" && currentUserID > 0 {
		// Join follows table to get posts from followed users
		// Subquery or Join
		query = query.Joins("JOIN follows ON follows.followed_id = posts.user_id").
			Where("follows.follower_id = ?", currentUserID)
	}

	// Count total for metadata (optional, might be slow for trending if table big)
	// For MVP we count.
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply Sorting and Pagination
	// Note: ORDER BY RAND(seed) allows repeatable random order.
	// We use OFFSET for pagination in this random mode.
	if err := query.Order(gorm.Expr(randSeed)).
		Offset(offset).
		Limit(limit).
		Find(&posts).Error; err != nil {
		return nil, 0, err
	}

	return posts, total, nil
}
