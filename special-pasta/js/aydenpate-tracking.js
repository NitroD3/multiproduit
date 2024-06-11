jQuery(document).ready(function($) {
    var map;
    var driverMarker;

    function initializeMap() {
        var mapOptions = {
            zoom: 15,
            center: new google.maps.LatLng(0, 0)
        };
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        driverMarker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(0, 0),
            icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });
    }

    function updateDeliveryStatus() {
        $.ajax({
            url: aydenpate_data.ajax_url,
            method: 'POST',
            data: {
                action: 'get_delivery_status',
                order_id: aydenpate_data.order_id
            },
            success: function(response) {
                if (response.success) {
                    $('#delivery-status').text(response.data.status);
                    var location = response.data.location.split(',');
                    var latLng = new google.maps.LatLng(location[0], location[1]);
                    driverMarker.setPosition(latLng);
                    map.setCenter(latLng);
                }
            }
        });
    }

    // Initialize the map
    initializeMap();

    // Update delivery status every 10 seconds
    setInterval(updateDeliveryStatus, 10000);
});
