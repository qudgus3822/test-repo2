# example request

http://localhost:5173/api/v1/traceability?metricName=review_speed&periodKey=2026-02&aggregationLevel=DIVISION&departmentCode=2000

# example response

```json
{
  "metricInfo": {
    "title": "리뷰 속도",
    "category": "review",
    "aggregationType": "AVG",
    "rawUnit": "초",
    "displayUnit": "시간",
    "timeUnitConversion": "seconds_to_hours"
  },
  "query": {
    "metricName": "review_speed",
    "periodKey": "2026-02",
    "period": "MONTHLY",
    "aggregationLevel": "DIVISION"
  },
  "root": {
    "level": "DIVISION",
    "departmentCode": "2000",
    "departmentName": "모두플랫폼개발실",
    "metric": {
      "value": 0.07,
      "rawValue": 217.2,
      "score": 100,
      "weightedScore": 13.812154696132595,
      "count": 5,
      "countLabel": "DAYS",
      "unit": "시간"
    },
    "aggregationMethod": "WEIGHTED_AVERAGE",
    "children": [
      {
        "level": "TEAM",
        "departmentCode": "2100",
        "departmentName": "A플랫폼개발팀",
        "metric": {
          "value": 0.05,
          "rawValue": 176,
          "score": 100,
          "weightedScore": 16.666666666666664,
          "count": 1,
          "countLabel": "DAYS",
          "unit": "시간"
        },
        "aggregationMethod": "WEIGHTED_AVERAGE",
        "children": [
          {
            "level": "MEMBER",
            "memberId": "696083587fe1f5455e8db66f",
            "memberName": "이승우",
            "memberEmail": "",
            "memberEmployeeId": "moco.seungwoo",
            "metric": {
              "value": 0.05,
              "rawValue": 176,
              "score": 100,
              "weightedScore": 16.666666666666664,
              "count": 1,
              "countLabel": "DAYS",
              "unit": "시간"
            },
            "rawDailyData": [
              {
                "date": "20260202",
                "value": 176,
                "totalCount": 2,
                "relatedMergeRequests": [
                  {
                    "iid": 22,
                    "repositoryId": 77132601
                  },
                  {
                    "iid": 30,
                    "repositoryId": 77132541
                  }
                ],
                "details": {
                  "averageFormatted": "3m",
                  "count": 2,
                  "mergeRequests": [
                    {
                      "id": "22",
                      "repositoryId": 77132601,
                      "responseTime": 176,
                      "reviewRequestTime": "2026-02-02T11:02:05Z",
                      "firstResponseTime": "2026-02-02T11:05:01Z",
                      "responseTimeFormatted": "3m"
                    },
                    {
                      "id": "30",
                      "repositoryId": 77132541,
                      "responseTime": 177,
                      "reviewRequestTime": "2026-02-02T12:02:04Z",
                      "firstResponseTime": "2026-02-02T12:05:01Z",
                      "responseTimeFormatted": "3m"
                    }
                  ],
                  "invalidMergeRequests": []
                }
              }
            ],
            "mergeRequests": [
              {
                "iid": 22,
                "repositoryId": 77132601,
                "repositoryName": "moco_api",
                "title": "feat(COME-20): OAuth2 소셜 로그인 연동",
                "author": "moco.dohyun",
                "authorEmail": "",
                "reviewers": ["moco.seungwoo"],
                "sourceBranch": "feature/come-20",
                "targetBranch": "master",
                "createdAt": "2026-02-02T11:02:05.000Z",
                "mergedAt": "2026-02-02T11:08:02.000Z",
                "projectEpicKey": "come-20",
                "projectName": "사용자 인증 시스템 개선"
              },
              {
                "iid": 30,
                "repositoryId": 77132541,
                "repositoryName": "moco_next",
                "title": "feat(COME-23): 이메일 발송 서비스 연동",
                "author": "moco.junhyuk",
                "authorEmail": "",
                "reviewers": ["moco.seungwoo"],
                "sourceBranch": "feature/come-23",
                "targetBranch": "master",
                "createdAt": "2026-02-02T12:02:04.000Z",
                "mergedAt": "2026-02-02T12:11:02.000Z",
                "projectEpicKey": "come-23",
                "projectName": "알림 시스템 구축"
              }
            ]
          }
        ]
      },
      {
        "level": "TEAM",
        "departmentCode": "2200",
        "departmentName": "B플랫폼개발팀",
        "metric": {
          "value": 0.07,
          "rawValue": 225.66666666666666,
          "score": 100,
          "weightedScore": 13.29394387001477,
          "count": 3,
          "countLabel": "DAYS",
          "unit": "시간"
        },
        "aggregationMethod": "WEIGHTED_AVERAGE",
        "children": [
          {
            "level": "MEMBER",
            "memberId": "696083597fe1f5455e8db679",
            "memberName": "최민재",
            "memberEmail": "",
            "memberEmployeeId": "moco.minjae",
            "metric": {
              "value": 0.06,
              "rawValue": 206,
              "score": 100,
              "weightedScore": 14.563106796116504,
              "count": 1,
              "countLabel": "DAYS",
              "unit": "시간"
            },
            "rawDailyData": [
              {
                "date": "20260202",
                "value": 206,
                "totalCount": 2,
                "relatedMergeRequests": [
                  {
                    "iid": 26,
                    "repositoryId": 77132601
                  },
                  {
                    "iid": 26,
                    "repositoryId": 77132541
                  }
                ],
                "details": {
                  "averageFormatted": "3m",
                  "count": 2,
                  "mergeRequests": [
                    {
                      "id": "26",
                      "repositoryId": 77132601,
                      "responseTime": 174,
                      "reviewRequestTime": "2026-02-02T12:11:07Z",
                      "firstResponseTime": "2026-02-02T12:14:01Z",
                      "responseTimeFormatted": "3m"
                    },
                    {
                      "id": "26",
                      "repositoryId": 77132541,
                      "responseTime": 238,
                      "reviewRequestTime": "2026-02-02T10:55:04Z",
                      "firstResponseTime": "2026-02-02T10:59:02Z",
                      "responseTimeFormatted": "4m"
                    }
                  ],
                  "invalidMergeRequests": []
                }
              }
            ],
            "mergeRequests": [
              {
                "iid": 26,
                "repositoryId": 77132601,
                "repositoryName": "moco_api",
                "title": "feat(COME-23): 알림 설정 API 엔드포인트",
                "author": "moco.jiwoo",
                "authorEmail": "",
                "reviewers": ["moco.minjae"],
                "sourceBranch": "feature/come-23",
                "targetBranch": "master",
                "createdAt": "2026-02-02T12:11:07.000Z",
                "mergedAt": "2026-02-02T12:21:02.000Z",
                "projectEpicKey": "come-23",
                "projectName": "알림 시스템 구축"
              },
              {
                "iid": 26,
                "repositoryId": 77132541,
                "repositoryName": "moco_next",
                "title": "feat(COME-20): JWT 토큰 갱신 로직 구현",
                "author": "moco.jiwoo",
                "authorEmail": "",
                "reviewers": ["moco.minjae"],
                "sourceBranch": "feature/come-20",
                "targetBranch": "master",
                "createdAt": "2026-02-02T10:55:04.000Z",
                "mergedAt": "2026-02-02T11:02:03.000Z",
                "projectEpicKey": "come-20",
                "projectName": "사용자 인증 시스템 개선"
              }
            ]
          },
          {
            "level": "MEMBER",
            "memberId": "696083597fe1f5455e8db67e",
            "memberName": "한지우",
            "memberEmail": "",
            "memberEmployeeId": "moco.jiwoo",
            "metric": {
              "value": 0.07,
              "rawValue": 234,
              "score": 100,
              "weightedScore": 12.82051282051282,
              "count": 1,
              "countLabel": "DAYS",
              "unit": "시간"
            },
            "rawDailyData": [
              {
                "date": "20260202",
                "value": 234,
                "totalCount": 1,
                "relatedMergeRequests": [
                  {
                    "iid": 23,
                    "repositoryId": 77132601
                  }
                ],
                "details": {
                  "averageFormatted": "4m",
                  "count": 1,
                  "mergeRequests": [
                    {
                      "id": "23",
                      "repositoryId": 77132601,
                      "responseTime": 234,
                      "reviewRequestTime": "2026-02-02T11:16:07Z",
                      "firstResponseTime": "2026-02-02T11:20:01Z",
                      "responseTimeFormatted": "4m"
                    }
                  ],
                  "invalidMergeRequests": []
                }
              }
            ],
            "mergeRequests": [
              {
                "iid": 23,
                "repositoryId": 77132601,
                "repositoryName": "moco_api",
                "title": "feat(COME-21): Redis 캐싱 레이어 구현",
                "author": "moco.minjae",
                "authorEmail": "",
                "reviewers": ["moco.jiwoo"],
                "sourceBranch": "feature/come-21",
                "targetBranch": "master",
                "createdAt": "2026-02-02T11:16:07.000Z",
                "mergedAt": "2026-02-02T11:28:02.000Z",
                "projectEpicKey": "come-21",
                "projectName": "API 성능 최적화"
              }
            ]
          },
          {
            "level": "MEMBER",
            "memberId": "696083597fe1f5455e8db683",
            "memberName": "강예린",
            "memberEmail": "",
            "memberEmployeeId": "moco.yerin",
            "metric": {
              "value": 0.07,
              "rawValue": 237,
              "score": 100,
              "weightedScore": 12.658227848101264,
              "count": 1,
              "countLabel": "DAYS",
              "unit": "시간"
            },
            "rawDailyData": [
              {
                "date": "20260202",
                "value": 237,
                "totalCount": 1,
                "relatedMergeRequests": [
                  {
                    "iid": 31,
                    "repositoryId": 77132541
                  }
                ],
                "details": {
                  "averageFormatted": "4m",
                  "count": 1,
                  "mergeRequests": [
                    {
                      "id": "31",
                      "repositoryId": 77132541,
                      "responseTime": 237,
                      "reviewRequestTime": "2026-02-02T12:21:04Z",
                      "firstResponseTime": "2026-02-02T12:25:01Z",
                      "responseTimeFormatted": "4m"
                    }
                  ],
                  "invalidMergeRequests": []
                }
              }
            ],
            "mergeRequests": [
              {
                "iid": 31,
                "repositoryId": 77132541,
                "repositoryName": "moco_next",
                "title": "feat(COME-23): 알림 히스토리 조회 기능",
                "author": "moco.dohyun",
                "authorEmail": "",
                "reviewers": ["moco.yerin"],
                "sourceBranch": "feature/come-23",
                "targetBranch": "master",
                "createdAt": "2026-02-02T12:21:04.000Z",
                "mergedAt": "2026-02-02T12:30:02.000Z",
                "projectEpicKey": "come-23",
                "projectName": "알림 시스템 구축"
              }
            ]
          }
        ]
      }
    ]
  },
  "rawDailyMetric": {
    "dateStart": "20260201",
    "dateEnd": "20260228",
    "documentCount": 6,
    "totalUsers": 8
  },
  "metadata": {
    "supportsMemberLevel": true,
    "lowestTraceLevel": "MEMBER",
    "mergeRequestsIncluded": true
  }
}
```
