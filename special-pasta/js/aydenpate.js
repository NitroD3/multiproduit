jQuery(document).ready(function($) {
    function displayOptions(step, options) {
        let html = '';
        options.forEach(option => {
            html += `<label class="option-label">
                        <input type="radio" name="${step}" value="${option.name}">
                        <img src="${option.image}" alt="${option.name}" class="option-image">
                        <span>${option.name}</span>
                    </label>`;
        });
        $(`#${step}-options`).html(html);
    }

    function showStep(step) {
        $('.order-step').hide();
        $(`#step-${step}`).show();
    }

    function updateSummary() {
        let summaryHtml = `<p>Pâtes: ${$('input[name="pasta"]:checked').val()}</p>
                           <p>Sauce: ${$('input[name="sauce"]:checked').val()}</p>
                           <p>Gratiné: ${$('input[name="cheese"]:checked').val()}</p>`;
        if ($('input[name="dessert"]:checked').val()) {
            summaryHtml += `<p>Dessert: ${$('input[name="dessert"]:checked').val()}</p>`;
        }
        if ($('input[name="drink"]:checked').val()) {
            summaryHtml += `<p>Boisson: ${$('input[name="drink"]:checked').val()}</p>`;
        }
        $('#summary-details').html(summaryHtml);
    }

    displayOptions('pasta', aydenpate_data.pasta_options);
    displayOptions('sauce', aydenpate_data.sauce_options);
    displayOptions('cheese', aydenpate_data.cheese_options);
    displayOptions('dessert', aydenpate_data.dessert_options);
    displayOptions('drink', aydenpate_data.drink_options);

    let currentStep = 1;
    showStep(currentStep);

    $('input[type="radio"]').on('change', function() {
        updateSummary();
        if (currentStep < 5) {
            currentStep++;
            showStep(currentStep);
        } else {
            $('#delivery-details').show();
            $('#order-summary').show();
        }
    });

    $('#add-to-cart').on('click', function() {
        let data = {
            action: 'aydenpate_add_to_cart',
            security: aydenpate_data.nonce,
            pasta: $('input[name="pasta"]:checked').val(),
            sauce: $('input[name="sauce"]:checked').val(),
            cheese: $('input[name="cheese"]:checked').val(),
            dessert: $('input[name="dessert"]:checked').val(),
            drink: $('input[name="drink"]:checked').val(),
            delivery_date: $('#delivery-date').val(),
            delivery_time: $('#delivery-time').val(),
            customer_address: $('#customer-address').val(),
            customer_phone: $('#customer-phone').val()
        };

        $.post(aydenpate_data.ajax_url, data, function(response) {
            if (response.success) {
                alert('Product added to cart!');
            } else {
                alert(response.data.message);
            }
        });
    });

    $('#remove-selection').on('click', function() {
        $('input[type="radio"]').prop('checked', false);
        $('#summary-details').html('');
        $('#delivery-details').hide();
        $('#order-summary').hide();
        currentStep = 1;
        showStep(currentStep);
    });

    // Ajoutez un bouton "Précédent" à chaque étape
    $('.order-step').each(function(index, step) {
        if (index > 0) { // Pas de bouton "Précédent" pour la première étape
            $(step).append('<button class="prev-step">Précédent</button>');
        }
    });

    // Lorsqu'un utilisateur clique sur le bouton "Précédent", affichez l'étape précédente
    $('.prev-step').on('click', function() {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    // Ajoutez une option "Aucun" à chaque étape
    $('.order-step').each(function(index, step) {
        if (index > 0) { // Pas d'option "Aucun" pour la première étape
            $(step).find('.options').append('<label class="option-label"><input type="radio" name="' + step.id + '" value="Aucun"><span>Aucun</span></label>');
        }
    });
});
