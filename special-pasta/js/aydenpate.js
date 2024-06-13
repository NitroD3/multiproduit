jQuery(document).ready(function($) {
    let currentStep = 1;
    let previousSelections = {};

    function showStep(step) {
        $('.order-step').hide();
        if (step <= 5) {
            $('#step-' + step).show();
            $('#next-step').show().text('Suivant').attr('data-step', step);
            $('#prev-step').show().attr('data-step', step - 1);
            $('#submit-order').hide();
            $('#delivery-details').hide();
            $('#order-summary').hide();
        } else {
            $('#next-step').hide();
            $('#prev-step').show().attr('data-step', step - 1);
            $('#submit-order').show();
            $('#delivery-details').show();
            $('#order-summary').show();
        }
        if (step === 1) {
            $('#prev-step').hide();
        }
    }

    $('#next-step').on('click', function() {
        if (currentStep < 6) {
            let selectedOption = $('#step-' + currentStep + ' input:checked').next('label').text();
            if (!selectedOption) {
                selectedOption = $('#step-' + currentStep + ' input:checked').val();
            }
            let selectedPrice = $('#step-' + currentStep + ' input:checked').siblings('span').text().split('€')[0].split('Prix : ')[1].trim() + '€';

            // Console logs for debugging
            console.log('Step: ' + currentStep);
            console.log('Selected Option: ' + selectedOption);
            console.log('Selected Price: ' + selectedPrice);

            // If there was a previous selection for this step, remove it
            if (previousSelections[currentStep]) {
                $('#order-details li[data-step="' + currentStep + '"]').remove();
            }

            // Add the new selection and store it as the previous selection for this step
            $('#order-details').append('<li data-step="' + currentStep + '">' + selectedOption + ' - Prix : ' + selectedPrice + ' <button type="button" class="edit-step" data-step="' + currentStep + '">Modifier</button></li>');
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
        let updatedOption = $('#step-' + step + ' input:checked').next('label').text();
        if (!updatedOption) {
            updatedOption = $('#step-' + step + ' input:checked').val();
        }
        let updatedPrice = $('#step-' + step + ' input:checked').siblings('span').text().split('€')[0].split('Prix : ')[1].trim() + '€';

        // Console logs for debugging
        console.log('Step: ' + step);
        console.log('Updated Option: ' + updatedOption);
        console.log('Updated Price: ' + updatedPrice);

        // Update the option and price in the order summary
        let $orderDetailItem = $('#order-details li[data-step="' + step + '"]');
        $orderDetailItem.html(updatedOption + ' - Prix : ' + updatedPrice + ' <button type="button" class="edit-step" data-step="' + step + '">Modifier</button>');
        previousSelections[step] = { option: updatedOption, price: updatedPrice };
    });

    $('#aydenpate-order-form').on('submit', function(e) {
        e.preventDefault();

        const deliveryAddress = $('#delivery-address').val();
        const deliveryPhone = $('#delivery-phone').val();

        if (!deliveryAddress || !deliveryPhone) {
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
            delivery_phone: deliveryPhone
        };

        $.post(aydenpate_data.ajax_url, formData, function(response) {
            if (response.success) {
                alert('Produit ajouté au panier');
                window.location.href = '/cart/';
            } else {
                alert('Erreur lors de l\'ajout au panier');
            }
        });
    });

    // Append options dynamically
    function appendOptions(containerId, options) {
        $.each(options, function(index, option) {
            $('#' + containerId).append(
                '<input type="radio" name="' + containerId + '" value="' + option.name + '">' + option.name +
                '<img src="' + option.image + '"><br>' +
                '<span>Prix : ' + option.price + '€</span><br>' +
                '<span>Description : ' + option.description + '</span><br>'
            );
        });
    }

    appendOptions('pasta-options', aydenpate_data.pasta_options);
    appendOptions('sauce-options', aydenpate_data.sauce_options);
    appendOptions('cheese-options', aydenpate_data.cheese_options);
    appendOptions('dessert-options', aydenpate_data.dessert_options);
    appendOptions('drink-options', aydenpate_data.drink_options);

    showStep(1);
});
