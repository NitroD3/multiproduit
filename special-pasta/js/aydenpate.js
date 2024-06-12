jQuery(document).ready(function($) {
    let currentStep = 1;

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
            $('#order-details').append('<li>' + selectedOption + ' <button type="button" class="edit-step" data-step="' + currentStep + '">Modifier</button></li>');
            currentStep++;
            showStep(currentStep);
        }
    });

    $('#prev-step').on('click', function() {
        currentStep--;
        $('#order-details li:last-child').remove();
        showStep(currentStep);
    });

    $(document).on('click', '.edit-step', function() {
        let step = $(this).data('step');
        currentStep = step;
        $('#order-details li:gt(' + (step - 1) + ')').remove();
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
        $('#pasta-options').append('<input type="radio" name="pasta" value="' + option.name + '">' + option.name + '<img src="' + option.image + '"><br>');
    });

    $.each(aydenpate_data.sauce_options, function(index, option) {
        $('#sauce-options').append('<input type="radio" name="sauce" value="' + option.name + '">' + option.name + '<img src="' + option.image + '"><br>');
    });

    $.each(aydenpate_data.cheese_options, function(index, option) {
        $('#cheese-options').append('<input type="radio" name="cheese" value="' + option.name + '">' + option.name + '<img src="' + option.image + '"><br>');
    });

    $.each(aydenpate_data.dessert_options, function(index, option) {
        $('#dessert-options').append('<input type="radio" name="dessert" value="' + option.name + '">' + option.name + '<img src="' + option.image + '"><br>');
    });

    $.each(aydenpate_data.drink_options, function(index, option) {
        $('#drink-options').append('<input type="radio" name="drink" value="' + option.name + '">' + option.name + '<img src="' + option.image + '"><br>');
    });

    showStep(1);
});
