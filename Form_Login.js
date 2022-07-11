
// Đối tượng Validator
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    var selectorRules = {}

    // Hàm thực hiện Validate
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];
        // Lặp qua từng rules và kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case "radio":
                case "checkbox":
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }

    // Hàm Xử lý inputValue
    function inputValue(inputElement) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        errorElement.innerText = ''
        getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
    }
    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form)
    if (formElement) {

        // Xử lý sự kiện Submit 
        formElement.onsubmit = function (e) {
            e.preventDefault()

            var isFormValid = true
            // Thực hiện lặp qua từng rule và validate nó
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })


            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInput = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInput).reduce(function (values, input) {
                        switch (input.type) {
                            case "radio":
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case "checkbox":
                                if(!input.matches(':checked')) return values;
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});

                    options.onSubmit(formValues)
                }
            }
        }


        // lặp qua mỗi rule và xử lý sự kiện trên rule
        options.rules.forEach((rule) => {

            // Lưu lại các rules trong mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            // var x= rule.selector
            var inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach((inputElement) => {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = () => {
                    validate(inputElement, rule)
                }

                // Xử lý khi người dùng nhập
                inputElement.oninput = () => {
                    inputValue(inputElement)
                }
            })

        });
    }
}

// Định nghĩa các rules
// Nguyên tắc của Rules
// 1.khi có lỗi trả ra message lỗi
// 2.khi hợp lệ, không trả lại
Validator.isRequired = (selector, messageWarning) => ({
    selector,
    test: function (value) {
        return value ? undefined : messageWarning || 'Vui lòng nhập trường này'
    }
})
Validator.isEmail = (selector, messageWarning) => ({
    selector,
    test: function (value) {
        var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        return regex.test(value) ? undefined : messageWarning || 'Vui lòng nhập trường này'
    }
})
Validator.minLength = (selector, min) => ({
    selector,
    test: function (value) {
        return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`
    }
})
Validator.isConfirmed = (selector, getConfirmValue, messageWarning) => ({
    selector,
    test: function (value) {
        return value === getConfirmValue() ? undefined : messageWarning
    }
})
































