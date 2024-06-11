jQuery(document).ready(function($) {
    var currentStep = 1;

    function loadOptions(step, options) {
        var container = $('#' + step + '-options');
        container.empty();
        options.forEach(function(option) {
            var optionHtml = '<div class="option"><img src="' + option.image + '" alt="' + option.name + '"><label>' + option.name + '</label><input type="radio" name="' + step + '" value="' + option.name + '"></div>';
            container.append(optionHtml);
        });
    }

    function showStep(step) {
        $('.order-step').hide();
        $('#step-' + step).show();
    }

    $('#aydenpate-order-form').on('click', '.order-step .option', function() {
        var selectedStep = $(this).closest('.order-step').attr('id').split('-')[1];
        if (selectedStep == currentStep) {
            currentStep++;
            showStep(currentStep);
        }
        if (currentStep > 5) {
            $('#delivery-details').show();
        }
        if (currentStep > 6) {
            $('#order-summary').show();
            $('.order-step').hide();
            $('#delivery-details').hide();
            var summaryHtml = '';
            $('input[type="radio"]:checked').each(function() {
                summaryHtml += '<p>' + $(this).closest('label').text() + ': ' + $(this).val() + '</p>';
            });
            $('#summary-details').html(summaryHtml);
        }
    });

    loadOptions('pasta', aydenpate_data.pasta_options);
    loadOptions('sauce', aydenpate_data.sauce_options);
    loadOptions('cheese', aydenpate_data.cheese_options);
    loadOptions('dessert', aydenpate_data.dessert_options);
    loadOptions('drink', aydenpate_data.drink_options);

    showStep(currentStep);

    $('#add-to-cart').on('click', function() {
        var formData = {
            action: 'aydenpate_add_to_cart',
            pasta: $('input[name="pasta"]:checked').val(),
            sauce: $('input[name="sauce"]:checked').val(),
            cheese: $('input[name="cheese"]:checked').val(),
            dessert: $('input[name="dessert"]:checked').val(),
            drink: $('input[name="drink"]:checked').val(),
            delivery_date: $('#delivery-date').val(),
            delivery_time: $('#delivery-time').val(),
            customer_address: $('#customer-address').val(),
            customer_phone: $('#customer-phone').val(),
        };

        $.post(aydenpate_data.ajax_url, formData, function(response) {
            if (response.success) {
                alert('Produit ajouté au panier');
                window.location.href = '/cart';
            } else {
                alert('Erreur lors de l\'ajout au panier');
            }
        });
    });
});
