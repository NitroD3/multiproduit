jQuery(document).ready(function($) {
    var currentStep = 1;

    function showStep(step) {
        $('.order-step').hide();
        $('#step-' + step).show();
        if (step === 1) {
            $('#next-step').show().text('Suivant');
            $('#submit-order').hide();
            $('#delivery-details').hide();
        } else if (step > 1 && step < 5) {
            $('#next-step').show().text('Suivant');
            $('#submit-order').hide();
            $('#delivery-details').hide();
        } else {
            $('#next-step').hide();
            $('#submit-order').show();
            $('#delivery-details').show();
        }
    }

    $('#next-step').on('click', function() {
        if (currentStep < 5) {
            currentStep++;
            showStep(currentStep);
        }
    });

    $('#aydenpate-order-form').on('submit', function(e) {
        e.preventDefault();

        var formData = {
            action: 'aydenpate_add_to_cart',
            security: aydenpate_data.nonce,
            pasta: $('#step-1 input:checked').val(),
            sauce: $('#step-2 input:checked').val(),
            cheese: $('#step-3 input:checked').val(),
            dessert: $('#step-4 input:checked').val(),
            drink: $('#step-5 input:checked').val(),
            delivery_address: $('#delivery-address').val(),
            delivery_instructions: $('#delivery-instructions').val(),
            delivery_phone: $('#delivery-phone').val()
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

    // Load options
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
});
