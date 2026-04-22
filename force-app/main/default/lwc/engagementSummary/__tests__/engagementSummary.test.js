import { createElement } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { registerApexTestWireAdapter } from '@salesforce/sfdx-lwc-jest';
import EngagementSummary from 'c/engagementSummary';
import getFinancialSummary from '@salesforce/apex/EngagementController.getFinancialSummary';
import createFollowUpTask from '@salesforce/apex/EngagementController.createFollowUpTask';

const getFinancialSummaryAdapter = registerApexTestWireAdapter(getFinancialSummary);

jest.mock(
    '@salesforce/apex/EngagementController.createFollowUpTask',
    () => ({
        default: jest.fn()
    }),
    { virtual: true }
);

jest.mock(
    '@salesforce/apex',
    () => ({
        refreshApex: jest.fn(() => Promise.resolve())
    }),
    { virtual: true }
);

const flushPromises = () => Promise.resolve();

describe('c-engagement-summary', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        jest.clearAllMocks();
    });

    it('renders the financial summary from the wire response', async () => {
        const element = createElement('c-engagement-summary', {
            is: EngagementSummary
        });
        element.recordId = 'a00123456789012345';
        document.body.appendChild(element);

        getFinancialSummaryAdapter.emit({
            amount: 12500,
            name: 'Q2 Expansion',
            taskCount: 3,
            eventCount: 2
        });
        await flushPromises();

        const formattedNumber = element.shadowRoot.querySelector(
            'lightning-formatted-number'
        );
        const content = element.shadowRoot.textContent;

        expect(formattedNumber.value).toBe(12500);
        expect(content).toContain('Completed Tasks: 3');
        expect(content).toContain('Upcoming Events: 2');
    });

    it('creates a follow-up task, shows a toast, and refreshes the wire', async () => {
        createFollowUpTask.mockResolvedValue(undefined);

        const element = createElement('c-engagement-summary', {
            is: EngagementSummary
        });
        element.recordId = 'a00123456789012345';
        const dispatchEventSpy = jest.spyOn(element, 'dispatchEvent');
        document.body.appendChild(element);

        getFinancialSummaryAdapter.emit({
            amount: 12500,
            name: 'Q2 Expansion',
            taskCount: 3,
            eventCount: 2
        });
        await flushPromises();

        element.shadowRoot.querySelector('lightning-button').click();
        await flushPromises();
        await flushPromises();

        expect(createFollowUpTask).toHaveBeenCalledWith({
            engagementId: 'a00123456789012345',
            engagementName: 'Q2 Expansion'
        });
        expect(refreshApex).toHaveBeenCalled();
        expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
        expect(dispatchEventSpy.mock.calls[0][0].detail.variant).toBe('success');
    });
});