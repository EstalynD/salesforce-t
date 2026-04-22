import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getFinancialSummary from '@salesforce/apex/EngagementController.getFinancialSummary';
import createFollowUpTask from '@salesforce/apex/EngagementController.createFollowUpTask';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EngagementSummary extends LightningElement {
    @api recordId;

    errorMessage;
    isCreatingTask = false;
    summary;
    wiredSummaryResult;

    @wire(getFinancialSummary, { engagementId: '$recordId' })
    wiredSummary(result) {
        this.wiredSummaryResult = result;

        if (result.data) {
            this.summary = result.data;
            this.errorMessage = undefined;
            return;
        }

        if (result.error) {
            this.summary = undefined;
            this.errorMessage = reduceErrorMessage(result.error);
        }
    }

    get hasSummary() {
        return Boolean(this.summary);
    }

    get disableFollowUp() {
        return !this.summary || this.isCreatingTask;
    }

    async handleFollowUp() {
        if (this.disableFollowUp) {
            return;
        }

        this.isCreatingTask = true;

        try {
            await createFollowUpTask({
                engagementId: this.recordId,
                engagementName: this.summary.name
            });

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Task created for tomorrow',
                    variant: 'success'
                })
            );

            await refreshApex(this.wiredSummaryResult);
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: reduceErrorMessage(error),
                    variant: 'error'
                })
            );
        } finally {
            this.isCreatingTask = false;
        }
    }
}

function reduceErrorMessage(error) {
    if (Array.isArray(error?.body)) {
        return error.body.map(({ message }) => message).join(', ');
    }

    return error?.body?.message || error?.message || 'An unexpected error occurred.';
}