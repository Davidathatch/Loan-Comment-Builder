const FieldType = {
    TEXT: 'text',
    DOLLAR: 'dollar',
    PERCENT: 'percent',
    NUMBER: 'number',
    DECIMAL: 'decimal'
}

/**
 * Stores data pertaining to a data field in the comment.
 */
class CommentField {
    constructor(key, label, value, type) {
        this.key = key;
        this.label = label;
        this.value = value;
        this.enabled = false;
        this.type = type;
    }

    /**
     * Returns a string representation of this field's value, formatted according to its type.
     * For example, a field of type DOLLAR will be prefixed with '$'.
     * @returns {*|string}
     * @constructor
     */
    GetValue() {
        switch (this.type) {
            case FieldType.DOLLAR:
                return `$${Number.parseFloat(this.value).toFixed(2)}`;
                break;
            case FieldType.PERCENT:
                return `${this.value}%`;
                break;
            default:
                return this.value;
        }
    }
}

/**
 * Stores form data and generates a comment.
 */
class CommentData {
    constructor() {
        this.fields = {
            'summary-value': new CommentField('summary-value', '', '', FieldType.TEXT),
            'loan-name-value': new CommentField('loan-name-value', 'Loan Name', '', FieldType.TEXT),
            'loan-amount-value': new CommentField('loan-amount-value', 'Loan Amount', 0.0, FieldType.DOLLAR),
            'loan-term-value': new CommentField('loan-term-value', 'Loan Term', '', FieldType.TEXT),
            'interest-rate-value': new CommentField('interest-rate-value', 'Interest Rate', 0.0, FieldType.PERCENT),
            'monthly-income-value': new CommentField('monthly-income-value', 'Monthly Income', 0.0, FieldType.DOLLAR),
            'income-verification-value': new CommentField('income-verification-value', 'Income Verification Src', '', FieldType.TEXT),
            'dti-before-value': new CommentField('dti-before-value', 'DTI Before', 0.0, FieldType.PERCENT),
            'dti-after-value': new CommentField('dti-after-value', 'DTI After', 0.0, FieldType.PERCENT),
            'discretionary-income-value': new CommentField('discretionary-income-value', 'Discretionary Income', 0.0, FieldType.DOLLAR),
            'credit-score-value': new CommentField('credit-score-value', 'Credit Score', 0, FieldType.NUMBER),
            'recommendation-value': new CommentField('recommendation-value', "Recommendation", '', FieldType.TEXT),
            'written-rec-value': new CommentField('written-rec-value', '', '', FieldType.TEXT)
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
     * Updates the key-value padding value to be the length of the largest attribute
     * value
     */
    #updateKeyValPadding() {
        this.keyValPadding = 0;

        // Update key-value padding
        for (let key in this.fields) {
            if ((this.fields[key].enabled))
                if (this.fields[key].label.length > this.keyValPadding)
                    this.keyValPadding = this.fields[key].label.length;
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
                return this.fields['loan-name-value'].enabled
                    || this.fields['loan-amount-value'].enabled
                    || this.fields['loan-term-value'].enabled
                    || this.fields['interest-rate-value'].enabled;
                break;

            case this.sections.APPLICANT_INFO:
                return this.fields['monthly-income-value'].enabled
                    || this.fields['income-verification-value'].enabled
                    || this.fields['monthly-income-value'].enabled
                    || this.fields['dti-before-value'].enabled
                    || this.fields['dti-after-value'].enabled
                    || this.fields['discretionary-income-value'].enabled
                    || this.fields['credit-score-value'].enabled;
                break;

            case this.sections.RECOMMENDATION:
                return this.fields['recommendation-value'].enabled
                    || this.fields['written-rec-value'].enabled;
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
        if (!(attributeName in this.fields) || !(this.fields[attributeName].enabled))
            return '';

        let result = this.fields[attributeName].label;
        result += ': ';
        for (let i = 0; i < (this.keyValPadding - this.fields[attributeName].label.length); i++)
            result += ' ';
        result += this.fields[attributeName].GetValue();
        result += '\n';

        return result;
    }

    /**
     * Updates the value of an attribute
     * @param attributeName attribute key
     * @param value new value
     */
    updateAttrVal(attributeName, value) {
        if (!(attributeName in this.fields))
            return;
        this.fields[attributeName].value = value;
        this.#updateKeyValPadding();
    }

    /**
     * Updates the enabled status of an attribute
     * @param attributeName name of attribute
     * @param enabled new enabled status
     */
    updateAttrEnabled(attributeName, enabled) {
        const fieldKey = attributeName.replace(/-enabled$/, '-value');
        if (!(fieldKey in this.fields))
            return;
        this.fields[fieldKey].enabled = enabled;
        this.#updateKeyValPadding();
    }

    generateComment() {
        this.#updateKeyValPadding();
        let result = '';

        // Add summary
        if (this.fields['summary-value'].enabled) {
            result += this.fields['summary-value'].value;
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
            if (this.fields["written-rec-value"].enabled)
                result += this.fields['written-rec-value'].value;
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