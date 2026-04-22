public with sharing class EngagementController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getFinancialSummary(Id engagementId) {
        validateEngagementId(engagementId);

        Engagement__c engagement;

        try {
            engagement = [
                SELECT Name, Related_Opportunity__r.Amount
                FROM Engagement__c
                WHERE Id = :engagementId
                LIMIT 1
            ];
        } catch (QueryException ex) {
            throw new AuraHandledException('Engagement not found.');
        }

        return new Map<String, Object>{
            'amount' => engagement.Related_Opportunity__r != null
                ? engagement.Related_Opportunity__r.Amount
                : null,
            'name' => engagement.Name,
            'taskCount' => [
                SELECT COUNT()
                FROM Task
                WHERE WhatId = :engagementId
                AND Status = 'Completed'
            ],
            'eventCount' => [
                SELECT COUNT()
                FROM Event
                WHERE WhatId = :engagementId
                AND StartDateTime >= :System.now()
            ]
        };
    }

    @AuraEnabled
    public static void createFollowUpTask(Id engagementId, String engagementName) {
        validateEngagementId(engagementId);

        String subjectName = String.isBlank(engagementName) ? 'this engagement' : engagementName;

        insert new Task(
            Subject = 'Follow-up on ' + subjectName,
            ActivityDate = Date.today().addDays(1),
            Type = 'Call',
            Status = 'Not Started',
            WhatId = engagementId
        );
    }

    private static void validateEngagementId(Id engagementId) {
        if (engagementId == null) {
            throw new AuraHandledException('Engagement Id is required.');
        }
    }
}