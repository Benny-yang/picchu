package repository

import (
	"azure-magnetar/internal/model"

	"gorm.io/gorm"
)

// ActivityRepository defines the interface for activity-related database operations.
type ActivityRepository interface {
	Create(activity *model.Activity) error
	GetByID(id uint) (*model.Activity, error)
	Update(activity *model.Activity) error
	Delete(id uint) error
	List(filter ActivityFilter) ([]model.Activity, int64, error)
	GetByUserID(userID uint) ([]model.Activity, error)

	// Participant operations
	CreateParticipant(p *model.ActivityParticipant) error
	DeleteParticipant(activityID, userID uint) error
	GetParticipant(activityID, userID uint) (*model.ActivityParticipant, error)
	ListParticipants(activityID uint) ([]model.ActivityParticipant, error)
	ListApplicants(activityID uint) ([]model.ActivityParticipant, error)
	UpdateParticipantStatus(id uint, status string) error
	CountAccepted(activityID uint) (int64, error)
	GetApplicationsByUserID(userID uint) ([]model.ActivityParticipant, error)
}

// ActivityFilter holds query parameters for listing activities.
type ActivityFilter struct {
	Location string
	DateFrom string
	DateTo   string
	Tags     string
	Offset   int
	Limit    int
}

type activityRepository struct {
	db *gorm.DB
}

// NewActivityRepository creates a new ActivityRepository.
func NewActivityRepository(db *gorm.DB) ActivityRepository {
	return &activityRepository{db: db}
}

func (r *activityRepository) Create(activity *model.Activity) error {
	return r.db.Create(activity).Error
}

func (r *activityRepository) GetByID(id uint) (*model.Activity, error) {
	var activity model.Activity
	if err := r.db.Preload("Host").Preload("Host.Profile").First(&activity, id).Error; err != nil {
		return nil, err
	}

	count, _ := r.CountAccepted(activity.ID)
	activity.CurrentParticipants = count

	return &activity, nil
}

func (r *activityRepository) Update(activity *model.Activity) error {
	return r.db.Save(activity).Error
}

func (r *activityRepository) Delete(id uint) error {
	return r.db.Delete(&model.Activity{}, id).Error
}

func (r *activityRepository) List(filter ActivityFilter) ([]model.Activity, int64, error) {
	var activities []model.Activity
	var total int64

	query := r.db.Model(&model.Activity{}).Preload("Host").Preload("Host.Profile")

	if filter.Location != "" {
		query = query.Where("location LIKE ?", "%"+filter.Location+"%")
	}
	if filter.DateFrom != "" {
		query = query.Where("event_time >= ?", filter.DateFrom)
	}
	if filter.DateTo != "" {
		query = query.Where("event_time <= ?", filter.DateTo)
	}
	if filter.Tags != "" {
		query = query.Where("tags LIKE ?", "%"+filter.Tags+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if filter.Limit <= 0 {
		filter.Limit = 20
	}

	if err := query.Order("created_at DESC").
		Offset(filter.Offset).
		Limit(filter.Limit).
		Find(&activities).Error; err != nil {
		return nil, 0, err
	}

	// efficient enough for now
	for i := range activities {
		count, _ := r.CountAccepted(activities[i].ID)
		activities[i].CurrentParticipants = count
	}

	return activities, total, nil
}

func (r *activityRepository) GetByUserID(userID uint) ([]model.Activity, error) {
	var activities []model.Activity

	// Activities hosted by user OR joined (accepted) by user
	err := r.db.Preload("Host").Preload("Host.Profile").
		Where("host_id = ? OR id IN (?)",
			userID,
			r.db.Model(&model.ActivityParticipant{}).
				Select("activity_id").
				Where("user_id = ? AND status = ?", userID, "accepted"),
		).
		Order("created_at DESC").
		Find(&activities).Error

	if err == nil {
		for i := range activities {
			count, _ := r.CountAccepted(activities[i].ID)
			activities[i].CurrentParticipants = count
		}
	}

	return activities, err
}

// --- Participant operations ---

func (r *activityRepository) CreateParticipant(p *model.ActivityParticipant) error {
	return r.db.Create(p).Error
}

func (r *activityRepository) DeleteParticipant(activityID, userID uint) error {
	return r.db.
		Where("activity_id = ? AND user_id = ?", activityID, userID).
		Delete(&model.ActivityParticipant{}).Error
}

func (r *activityRepository) GetParticipant(activityID, userID uint) (*model.ActivityParticipant, error) {
	var p model.ActivityParticipant
	if err := r.db.
		Where("activity_id = ? AND user_id = ?", activityID, userID).
		First(&p).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *activityRepository) ListParticipants(activityID uint) ([]model.ActivityParticipant, error) {
	var participants []model.ActivityParticipant
	err := r.db.Preload("User").
		Where("activity_id = ? AND status = ?", activityID, "accepted").
		Find(&participants).Error
	return participants, err
}

func (r *activityRepository) ListApplicants(activityID uint) ([]model.ActivityParticipant, error) {
	var applicants []model.ActivityParticipant
	err := r.db.Preload("User").Preload("User.Profile").
		Where("activity_id = ?", activityID).
		Order("applied_at DESC").
		Find(&applicants).Error
	return applicants, err
}

func (r *activityRepository) UpdateParticipantStatus(id uint, status string) error {
	return r.db.Model(&model.ActivityParticipant{}).
		Where("id = ?", id).
		Update("status", status).Error
}

func (r *activityRepository) CountAccepted(activityID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.ActivityParticipant{}).
		Where("activity_id = ? AND status = ?", activityID, "accepted").
		Count(&count).Error
	return count, err
}

func (r *activityRepository) GetApplicationsByUserID(userID uint) ([]model.ActivityParticipant, error) {
	var applications []model.ActivityParticipant
	err := r.db.Preload("Activity").Preload("Activity.Host").
		Where("user_id = ?", userID).
		Order("applied_at DESC").
		Find(&applications).Error
	return applications, err
}
