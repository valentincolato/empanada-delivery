# Background Job Management

## Introduction

We're implementing a new and improved approach to background job management in our application. This documentation provides insights into the revamped system, including the introduction of priority queues and guidelines on how to seamlessly integrate background jobs.

## Priority Queues

We've use to a multi-queue structure with distinct priorities. This allows us to better organize and prioritize tasks based on their criticality. Here's an overview of the new queue structure:

    Low Priority (10 instances)
        imports
        exports
        import_images

    Default Priority (8 instances)
        notify_dbip_error
        searchkick

    High Priority (2 instances)
        leads
        mailers
        save_searches

    Critical Priority (1 instance)
        Reserved for manual admin-initiated jobs, like import/export operations.

## Usage

We have two alternatives to applied a priority for a job.

1. Job Class Method

    Within your job class, define the desired queue using the queue_name method. For example:

```ruby
class RunExportJob
  def perform
    ## do_something
  end

  def queue_name
    'low' # Options: 'low', 'default', 'high', 'critical'
  end
end
```
2. Enqueue with Queue Parameter

    When enqueuing a job, set the queue parameter using the Delayed::Job.enqueue method:

  ```ruby
  Delayed::Job.enqueue(SendSavedSearchJob.new(id: search.id), queue: 'high')
  ```

  Select the appropriate queue ('low', 'default', 'high', or 'critical') based on the task's priority.

## Job Details

Jobs without values in Min, Max, Avg, or Count are currently not being executed, either because they are disabled, have not been triggered within the analyzed period, or are only used in exceptional cases.

### One-off Jobs
| Job Class/Mailer                       | Queue   | Use             |
|----------------------------------------|---------|-----------------|
| CopyAndRenameImageFromDbJob            | one_off |                 |
| CopyAndRenameImageFromS3Job            | one_off |                 |
| OneTime::BoatImages::SaveImagesJob     | one_off |                 |
| Wfyb::DownloadRbListingFeedJob         | one_off |                 |
| Wfyb::ImportAllMakesAndModelsJob       | one_off |                 |
| Wfyb::ImportRbListingFeedJob           | one_off |                 |
| RecreateImageVersionsJob               | one_off |                 |
| Wfyb::ImportCategoriesJob              | inline  |                 |

### Low Priority Jobs
| Job Class/Mailer                         | Queue | Use             | Min     | Max       | Avg      | Count |
|------------------------------------------|-------|-----------------|---------|-----------|----------|-------|
| ConvertBoatImagesNameJob                 | low   |                 |         |           |          |       |
| CacheBoatDetailsPageJob                  | low   |                 |         |           |          |       |
| Replicate::UploadBoatImageToReplicateJob | low   | enqueue_once    | 4.2140  | 61.1575   | 5.96844  | 11000 |
| ImportBoatImagesJob                      | low   | enqueue_once    | 0.0378  | 2054.9423 | 5.04292  | 32057 |
| Statistics::GenerateDailyListingBoats    | low   | enqueue         | 2.8485  | 2.8485    | 2.8485   | 1     |
| Statistics::TrafficViewJob               | low   | enqueue         | 0.0372  | 0.3548    | 0.0863679| 499   |
| Statistics::RankingViewJob               | low   | enqueue         | 0.0540  | 18.8478   | 0.637131 | 499   |
| DeleteOldUserActivitiesJob               | low   | perform_later   |         |           |          |       |
| MonthlyHubStatisticsJob                  | low   | enqueue         |         |           |          |       |
| OpenAiBatchesPollingJob                  | low   | enqueue_once    | 1.2964  | 82.8318   | 5.6916   | 288   |
| UpdatePreOrderedBoatsStatusJob           | low   | perform_later   | 0.2694  | 0.2694    | 0.2694   | 1     |
| UserActivityJob                          | low   | enqueue         | -       | -         |  -       | -     |
| MongoTrackingJob                         | low   | enqueue         | -       | -         | -        | -     |

### Default Priority Jobs
| Job Class/Mailer                       | Queue   | Use             | Min     | Max      | Avg       | Count  |
|----------------------------------------|---------|-----------------|---------|----------|-----------|--------|
| RateBoatQualityJob                     | default | enqueue_once    | 0.0131  | 0.8531   | 0.0476885 | 37857  |
| BoatPriceEstimationJob                 | default | enqueue_once    | 0.0547  | 4.7863   | 0.360447  | 1500   |
| NotifyDbipErrorJob                     | default | enqueue         |         |          |           |        |
| PickFeaturedBoatJob                    | default | perform_later   |         |          |           |        |
| ProcessIntegrationEventJob             | default | enqueue_once    | 0.2508  | 1.1836   | 0.6912    | 15     |
| SimilarModelsJob                       | default | enqueue_once    | 7.7823  | 283.6818 | 15.5181   | 96     |
| MongoClient.insert_one                 | default |                 | 0.0135  | 0.6627   | 0.0486929 | 266    |
| RunExportJob                           | default | enqueue_once    | 20.4640 | 54016.5820| 483.371 | 523   |
| RunImportJob                           | default | enqueue_once    | 2.4382  | 1422.5527| 45.9015  | 247   |

### High Priority Jobs
| Job Class/Mailer                       | Queue | Use             | Min     | Max     | Avg      | Count |
|----------------------------------------|-------|-----------------|---------|---------|----------|-------|
| SendSavedSearchJob                     | high  | enqueue         | 0.0127  | 37.2177 | 1.2898   | 78825 |
| SendSavedSearchSimilarJob              | high  | enqueue         | 0.0146  | 4.7372  | 0.801185 | 18700 |
| VisitedBoatsReminderJob                | high  | enqueue_once    |         |         |          |       |
| ExpertMailer                           | high  | deliver_later   |         |         |          |       |
| LeadsMailer                            | high  | deliver_later   | 0.6515  | 3.2966  | 1.80614  | 48    |
| UserMailer                             | high  | deliver_later   | 1.1436  | 5.2743  | 2.44878  | 29512 |
| StaffMailer                            | high  | deliver_later   | 1.1856  | 2.5582  | 1.7242   | 28    |

### Critical Priority Jobs
| Job Class/Mailer                       | Queue    | Use             | Min     | Max     | Avg      | Count |
|----------------------------------------|----------|-----------------|---------|---------|----------|-------|
| LeadCreatedNotifyManufacturerMailsJob  | critical |                 |         |         |          |       |
| DeliverMessageJob                      | critical | enqueue         | 1.3212  | 4.0107  | 2.16887  | 8     |
| LeadCreatedNotifyBuyerMailsJob         | critical | enqueue         | 1.4228  | 7.3891  | 4.34728  | 98    |
