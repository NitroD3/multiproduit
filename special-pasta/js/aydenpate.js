jQuery(document).ready(function($) {
    let currentStep = 1;
    let previousSelections = {};
    let totalPrice = 0;

    function showStep(step) {
        $('.order-step').removeClass('active').hide();
        $('#step-' + step).addClass('active').fadeIn();
        if (step < 6) {
            $('#next-step').show().text('Suivant').attr('data-step', step);
            $('#prev-step').show().attr('data-step', step - 1);
            $('#submit-order').hide();
            $('#delivery-details').hide();
            $('#order-summary').hide();
        } else {
            $('#next-step').hide();
            $('#prev-step').show().attr('data-step', step - 1);
            $('#submit-order').show();
            $('#delivery-details').fadeIn();
            $('#order-summary').fadeIn();
            updateTotalPrice();
        }
        if (step === 1) {
            $('#prev-step').hide();
        }
        validateStep();
    }

    function updateTotalPrice() {
        totalPrice = 0;
        $('#order-details li').each(function() {
            let priceText = $(this).text().match(/Prix : (\d+(\.\d+)?)/); // Updated regex to match prices with and without decimals
            if (priceText) {
                totalPrice += parseFloat(priceText[1]);
            }
        });
        $('#total-price').text('Prix total : ' + totalPrice.toFixed(2) + '€');
    }

    function validateStep() {
        if ($('#step-' + currentStep + ' input:checked').length === 0) {
            $('#next-step').prop('disabled', true);
        } else {
            $('#next-step').prop('disabled', false);
        }
    }

    $('#next-step').on('click', function() {
        if (currentStep < 6) {
            let selectedOption = $('#step-' + currentStep + ' input:checked').val();
            let selectedLabel = (selectedOption === 'none') ? 'Sans' : $('#step-' + currentStep + ' input:checked').closest('label').find('span.description').text();
            let selectedPrice = $('#step-' + currentStep + ' input:checked').closest('label').find('span.price').text().trim();

            // If there was a previous selection for this step, remove it
            if (previousSelections[currentStep]) {
                $('#order-details li[data-step="' + currentStep + '"]').remove();
            }

            // Add the new selection and store it as the previous selection for this step
            $('#order-details').append('<li data-step="' + currentStep + '">' + selectedLabel + ' - ' + selectedPrice + ' <button type="button" class="edit-step" data-step="' + currentStep + '">Modifier</button></li>');
            previousSelections[currentStep] = { option: selectedOption, price: selectedPrice };

            currentStep++;
            showStep(currentStep);
        }
    });

    $('#prev-step').on('click', function() {
        currentStep--;
        showStep(currentStep);
    });

    $(document).on('click', '.edit-step', function() {
        let step = $(this).data('step');
        currentStep = step;
        showStep(step);

        // Update the price in the order details when modifying an item
        let updatedOption = $('#step-' + step + ' input:checked').val();
        let updatedLabel = (updatedOption === 'none') ? 'Sans' : $('#step-' + step + ' input:checked').closest('label').find('span.description').text();
        let updatedPrice = $('#step-' + step + ' input:checked').closest('label').find('span.price').text().trim();

        // Update the option and price in the order summary
        let $orderDetailItem = $('#order-details li[data-step="' + step + '"]');
        $orderDetailItem.html(updatedLabel + ' - ' + updatedPrice + ' <button type="button" class="edit-step" data-step="' + step + '">Modifier</button>');
        previousSelections[step] = { option: updatedOption, price: updatedPrice };

        updateTotalPrice();
    });

    $('#aydenpate-order-form').on('submit', function(e) {
        e.preventDefault();

        const deliveryAddress = $('#delivery-address').val();
        const deliveryPhone = $('#delivery-phone').val();
        const paymentMethod = $('input[name="payment-method"]:checked').val(); // Get selected payment method

        if (!deliveryAddress || !deliveryPhone || !paymentMethod) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        let formData = {
            action: 'aydenpate_add_to_cart',
            security: aydenpate_data.nonce,
            pasta: $('#step-1 input:checked').val(),
            sauce: $('#step-2 input:checked').val(),
            cheese: $('#step-3 input:checked').val(),
            dessert: $('#step-4 input:checked').val(),
            drink: $('#step-5 input:checked').val(),
            delivery_address: deliveryAddress,
            delivery_instructions: $('#delivery-instructions').val(),
            delivery_phone: deliveryPhone,
            payment_method: paymentMethod // Include payment method in form data
        };

        $.post(aydenpate_data.ajax_url, formData, function(response) {
            if (response.success) {
                alert('Produit ajouté au panier');
                window.location.href = '/cart/';
            } else {
                alert('Erreur lors de l\'ajout au panier : ' + response.data.message);
                console.log(response.data);
            }
        });
    });

    // Append options dynamically
    function appendOptions(containerId, options, includeNone = false) {
        if (includeNone) {
            $('#' + containerId).append(
                '<label class="option"><input type="radio" name="' + containerId + '" value="none"> Sans <br><span class="price">Prix : 0.00€</span><br></label>'
            );
        }
        $.each(options, function(index, option) {
            $('#' + containerId).append(
                '<label class="option"><input type="radio" name="' + containerId + '" value="' + option.name + '"> ' + option.name +
                '<img src="' + option.image + '"><br>' +
                '<span class="price">Prix : ' + option.price + '€</span><br>' +
                '<span class="description">' + option.name + '</span></label>' // Updated to include a span with class description for product name
            );
        });
    }

    appendOptions('pasta-options', aydenpate_data.pasta_options);
    appendOptions('sauce-options', aydenpate_data.sauce_options);
    appendOptions('cheese-options', aydenpate_data.cheese_options, true); // Including "None"
    appendOptions('dessert-options', aydenpate_data.dessert_options, true); // Including "None"
    appendOptions('drink-options', aydenpate_data.drink_options, true); // Including "None"

    $('input[type=radio]').on('change', function() {
        validateStep();
    });

    showStep(1);
});
