jQuery(document).ready(function($) {
    var orderId = $('#aydenpate-tracking-widget').data('order-id');

    function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: { lat: 0, lng: 0 }
        });

        var marker = new google.maps.Marker({
            position: { lat: 0, lng: 0 },
            map: map
        });

        updateMap(map, marker);
    }

    function updateMap(map, marker) {
        $.post(aydenpate_data.ajax_url, {
            action: 'get_delivery_status',
            security: aydenpate_data.nonce,
            order_id: orderId
        }, function(response) {
            if (response.success) {
                var status = response.data.status;
                $('#status').text('Statut de la livraison : ' + status);

                if (response.data.location) {
                    var latLng = new google.maps.LatLng(response.data.location.lat, response.data.location.lng);
                    map.setCenter(latLng);
                    marker.setPosition(latLng);
                }
            }

            setTimeout(function() {
                updateMap(map, marker);
            }, 10000);
        });
    }

    initMap();
});
