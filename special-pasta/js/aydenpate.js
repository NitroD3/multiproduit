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
            let selectedPrice = $('#step-' + currentStep + ' input:checked').nextAll('span:contains("Prix")').text();

            // If there was a previous selection for this step, remove it
            if (previousSelections[currentStep]) {
                $('#order-details li[data-step="' + currentStep + '"]').remove();
            }

            // Add the new selection and store it as the previous selection for this step
            $('#order-details').append('<li data-step="' + currentStep + '">' + selectedOption + ' - ' + selectedPrice + ' <button type="button" class="edit-step" data-step="' + currentStep + '">Modifier</button></li>');
            previousSelections[currentStep] = selectedOption;

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

    $.each(aydenpate_data.pasta_options, function(index, option) {
        $('#pasta-options').append('<input type="radio" name="pasta" value="' + option.name + '">' + option.name + '<img src="' + option.image + '"><br><span>Prix : ' + option.price + '</span><br><span>Description : ' + option.description + '</span><br>');
    });

    $.each(aydenpate_data.sauce_options, function(index, option) {
        $('#sauce-options').append('<input type="radio" name="sauce" value="' + option.name + '">' + option.name + '<img src="' + option.image + '"><br><span>Prix : ' + option.price + '</span><br><span>Description : ' + option.description + '</span><br>');
    });

    $.each(aydenpate_data.cheese_options, function(index, option) {
        $('#cheese-options').append('<input type="radio" name="cheese" value="' + option.name + '">' + option.name + '<img src="' + option.image + '"><br><span>Prix : ' + option.price + '</span><br><span>Description : ' + option.description + '</span><br>');
    });

    $.each(aydenpate_data.dessert_options, function(index, option) {
        $('#dessert-options').append('<input type="radio" name="dessert" value="' + option.name + '">' + option.name + '<img src="' + option.image + '"><br><span>Prix : ' + option.price + '</span><br><span>Description : ' + option.description + '</span><br>');
    });

    $.each(aydenpate_data.drink_options, function(index, option) {
        $('#drink-options').append('<input type="radio" name="drink" value="' + option.name + '">' + option.name + '<img src="' + option.image + '"><br><span>Prix : ' + option.price + '</span><br><span>Description : ' + option.description + '</span><br>');
    });

    showStep(1);
});
