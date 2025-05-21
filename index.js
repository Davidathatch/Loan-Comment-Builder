/**
 * Stores form data and generates a comment.
 */
class CommentData {
    constructor() {
        // Values of each attribute. Key is ID of an input element
        this.values = {
            'summary-value': {'value': '', 'label': ''},
            'loan-name-value': {'value': '', 'label': 'Loan Name'},
            'loan-amount-value': {'value': 0.0, 'label': 'Loan Amount'},
            'loan-term-value': {'value': '', 'label': 'Loan Term'},
            'interest-rate-value': {'value': 0.0, 'label': 'Interest Rate'},
            'monthly-income-value': {'value': 0.0, 'label': 'Monthly Income'},
            'income-verification-value': {'value': '', 'label': 'Income Verification Method'},
            'dti-before-value': {'value': 0.0, 'label': 'DTI Before'},
            'dti-after-value': {'value': 0.0, 'label': 'DTI After'},
            'discretionary-income-value': {'value': 0.0, 'label': 'Discretionary Income'},
            'credit-score-value': {'value': 0, 'label': 'Credit Score'},
            'recommendation-value': {'value': '', 'label': 'Recommendation'},
            'written-rec-value': {'value': '', 'label': ''}
        };

        // Tracks whether an attribute should be included in the output
        this.enabled = {
            'summary-enabled': true,
            'loan-name-enabled': true,
            'loan-amount-enabled': true,
            'loan-term-enabled': true,
            'interest-rate-enabled': true,
            'monthly-income-enabled': true,
            'income-verification-enabled': true,
            'dti-before-enabled': true,
            'dti-after-enabled': true,
            'discretionary-income-enabled': true,
            'credit-score-enabled': true,
            'recommendation-enabled': true,
            'written-rec-enabled': true
        };

        // Enum of different sections of comment. Each section contains at least one value.
        this.sections = {
            LOAN_INFO: 'loan-info',
            APPLICANT_INFO: 'applicant-info',
            RECOMMENDATION: 'recommendation'
        };

        // Number of positions from the left to print values
        this.keyValPadding = 0;

        // Character used for the top of header borders
        this.topBorderChar = '-';

        // Character used for the sides of header borders
        this.sideBorderChar = '|';

        // Character used for the corners of header borders
        this.cornerBorderChar = '+';

        // Number of padding spaces to place to the left and right of the border
        this.borderLRPadding = 1;
    }

    /**
     * Checks whether an attribute is enabled given the key used to access its value
     * @param valKey key for attribute's value
     * @returns {*|boolean} true if enabled, false if disabled or key is invalid
     */
    #valIsEnabled(valKey) {
        const enabledKey = valKey.replace(/-value$/, '-enabled');
        if (enabledKey in this.enabled)
            return this.enabled[enabledKey];
        return false;
    }

    /**
     * Updates the key-value padding value to be the length of the largest attribute
     * value
     */
    #updateKeyValPadding() {
        this.keyValPadding = 0;

        // Update key-value padding
        for (let key in this.values) {
            if ((this.#valIsEnabled(key)))
                if (this.values[key]['label'].length > this.keyValPadding)
                    this.keyValPadding = this.values[key]['label'].length;
        }
    }

    /**
     * Checks whether a section of attributes is enabled
     * @param section section to check
     * @returns {boolean} true if the section is enabled
     */
    #sectionIsEnabled(section) {
        switch (section) {
            case this.sections.LOAN_INFO:
                return this.enabled['loan-name-enabled']
                    || this.enabled['loan-amount-enabled']
                    || this.enabled['loan-term-enabled']
                    || this.enabled['interest-rate-enabled'];
                break;

            case this.sections.APPLICANT_INFO:
                return this.enabled['monthly-income-enabled']
                    || this.enabled['income-verification-enabled']
                    || this.enabled['monthly-income-enabled']
                    || this.enabled['dti-before-enabled']
                    || this.enabled['dti-after-enabled']
                    || this.enabled['discretionary-income-enabled']
                    || this.enabled['credit-score-enabled'];
                break;

            case this.sections.RECOMMENDATION:
                return this.enabled['recommendation-enabled']
                    || this.enabled['written-rec-enabled'];
                break;

            default:
                return false;
        }
    }

    /**
     * Surrounds some given text in a border
     * @param text text to be bordered
     */
    #createBorder(text) {
        // Top
        let result = this.cornerBorderChar;
        const TBSize = text.length + (this.borderLRPadding * 2);
        for (let i = 0; i < TBSize; i++)
            result += this.topBorderChar;
        result += this.cornerBorderChar;
        result += '\n';

        // Middle
        result += this.sideBorderChar;
        for (let i = 0; i < this.borderLRPadding; i++)
            result += ' ';
        result += text;
        for (let i = 0; i < this.borderLRPadding; i++)
            result += ' ';
        result += this.sideBorderChar;
        result += '\n';

        // Bottom
        result += this.cornerBorderChar;
        for (let i = 0; i < TBSize; i++)
            result += this.topBorderChar;
        result += this.cornerBorderChar;

        return result;
    }

    /**
     * Returns a formatted string containing an attribute value. Empty string is returned if
     * the attribute doesn't exist or isn't enabled.
     * @param attributeName name of attribute
     * @param label label to precede attribute value
     * @returns {*|string} resulting formatted string
     */
    #printAttribute(attributeName) {
        if (!(attributeName in this.values) || !(this.#valIsEnabled(attributeName)))
            return '';

        let result = this.values[attributeName]['label'];
        result += ': ';
        for (let i = 0; i < (this.keyValPadding - this.values[attributeName]['label'].length); i++)
            result += ' ';
        result += this.values[attributeName]['value'];
        result += '\n';

        return result;
    }

    /**
     * Updates the value of an attribute
     * @param attributeName attribute key
     * @param value new value
     */
    updateAttrVal(attributeName, value) {
        if (!(attributeName in this.values))
            return;
        this.values[attributeName]['value'] = value;
        this.#updateKeyValPadding();
    }

    /**
     * Updates the enabled status of an attribute
     * @param attributeName name of attribute
     * @param enabled new enabled status
     */
    updateAttrEnabled(attributeName, enabled) {
        if (!(attributeName in this.enabled))
            return;
        this.enabled[attributeName] = enabled;
        this.#updateKeyValPadding();
    }

    generateComment() {
        this.#updateKeyValPadding();
        let result = '';

        // Add summary
        if (this.enabled['summary-enabled']) {
            result += this.values['summary-value']['value'];
            result += '\n\n';
        }

        if (this.#sectionIsEnabled(this.sections.LOAN_INFO)) {
            result += this.#createBorder('Loan Information');
            result += '\n';
            result += this.#printAttribute('loan-name-value');
            result += this.#printAttribute('loan-amount-value');
            result += this.#printAttribute('loan-term-value');
            result += this.#printAttribute('interest-rate-value');
            result += '\n';
        }

        if (this.#sectionIsEnabled(this.sections.APPLICANT_INFO)) {
            result += this.#createBorder('Applicant Information');
            result += '\n';
            result += this.#printAttribute('monthly-income-value');
            result += this.#printAttribute('income-verification-value');
            result += this.#printAttribute('dti-before-value');
            result += this.#printAttribute('dti-after-value');
            result += this.#printAttribute('discretionary-income-value');
            result += this.#printAttribute('credit-score-value');
            result += '\n';
        }

        if (this.#sectionIsEnabled(this.sections.RECOMMENDATION)) {
            result += this.#createBorder('Recommendation');
            result += '\n';
            result += this.#printAttribute('recommendation-value');
            if (this.#valIsEnabled('written-rec-value'))
                result += this.values['written-rec-value']['value'];
            result += '\n';
        }

        return result;
    }
}

/**
 * Generates the comment and updates the DOM
 * @param commentData used to generate comment
 */
function UpdateComment(commentData, outputElement) {
    outputElement.value = data.generateComment();
}

const data = new CommentData();
const outputElement = document.getElementById('final-output');

// Add an event listener to each input field
const attributeInputs = document.getElementsByClassName('attribute-input');
for (let i = 0; i < attributeInputs.length; i++) {
    data.updateAttrVal(attributeInputs[i].id, attributeInputs[i].value);
    attributeInputs[i].addEventListener('input', (event) => {
        data.updateAttrVal(event.target.id, event.target.value);
        UpdateComment(data, outputElement);
    });
}

// Add an event listener to each checkbox
const checkboxInputs = document.getElementsByClassName('attribute-checkbox');
for (let i = 0; i < checkboxInputs.length; i++) {
    data.updateAttrEnabled(checkboxInputs[i].id, checkboxInputs[i].checked);
    checkboxInputs[i].addEventListener('change', (event) => {
        data.updateAttrEnabled(event.target.id, event.target.checked);
        UpdateComment(data, outputElement);
    });
}

UpdateComment(data, outputElement);