
/*
    Name: Constant.js
    Description: Module containing constant objects and keys.
*/
module.exports = {

    // supported question control types
    questionTypes: [
        {
            name: 'Text Field',
            key: 'text-field',
            label: 'Text Label',
            order: 0,
            template: '',
            description: 'Single line text field',
            defaultValue: '',
            type: 'text'
        },
        {
            name: 'Text Area',
            key: 'text-area',
            label: 'Text Label',
            lines: 10,
            order: 1,
            template: '',
            description: 'Multiline text field.',
            defaultValue: ''
        },
        {
            name: 'Dropdown',
            key: 'dropdown',
            label: 'Dropdown Label',
            options: [
                { name: 'Option1', value: '1' },
                { name: 'Option2', value: '2' },
                { name: 'Option3', value: '3' },
                { name: 'Option4', value: '4' }
            ],
            order: 2,
            template: '',
            description: 'Single key dropdown',
            defaultValue: null
        },
        {
            name: 'Multiple Choice',
            key: 'multi-choice',
            options: [
                { name: 'Node', value: 'nodejs' },
                { name: 'Angular', value: 'angular' },
                { name: 'Ionic', value: 'ionic' },
                { name: 'iOS', value: 'ios' }
            ],
            order: 3,
            template: '',
            description: 'Single key multiple choice selection',
            defaultValue: null
        },
        {
            name: 'Counter',
            key: 'counter',
            min: 0,
            max: 100,
            order: 4,
            template: '',
            description: 'Numeric counter',
            defaultValue: 0
        },
        {
            name: 'Slider',
            key: 'slider',
            label: 'Slider Label',
            min: 0,
            max: 100,
            order: 5,
            template: '',
            description: 'Numeric slider',
            defaultValue: 50
        },
        {
            name: 'Yes/No',
            key: 'yes-no',
            order: 6,
            template: '',
            description: 'Yes/No selection control',
            defaultValue: null
        },
        {
            name: 'Toggle',
            key: 'toggle',
            label: 'Toggle Label',
            order: 7,
            template: '',
            description: 'Toggle control',
            defaultValue: false
        },
        {
            name: 'Checkbox',
            key: 'checkbox',
            label: 'Checkbox Label',
            order: 8,
            template: '',
            description: 'Checkbox control',
            defaultValue: false
        },
        {
            name: 'Date',
            key: 'date',
            label: 'Date Label',
            order: 9,
            template: '',
            description: 'Date field',
            defaultValue: null
        },
        {
            name: 'Photo',
            key: 'photo',
            order: 10,
            template: '',
            description: 'Photo capture control',
            defaultValue: null
        }
    ],

    formStatus: [
        { name: 'Saved', key: 'saved', index: 0 },
        { name: 'Submitted', key: 'submitted', index: 1 }
    ],





};
