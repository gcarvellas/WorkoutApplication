(function ($) {
    $(document).ready(function () {
        var checkedMuscles = [];

        $('.muscleExisting').each(function () {
            const value = $(this).val();
            checkedMuscles.push(value);
        });

        $.each(checkedMuscles, function (i) {
            $('#' + checkedMuscles[i]).remove();
        });


        if($('.removeEquipmentLabel').length != 0 && $('.removeEquipmentInput').length != 0){
            $('.removeEquipment').show();
        } else {
            $('.removeEquipment').hide();
        }
    });

    $('.add-more').click(function () {
        var htmlToAdd = `<div class="input-group control-group" id="exercise-equipment-id">
                          <label for="exercise-equipment" class="col-sm-3 col-form-label removeEquipmentLabel">Additional Equipment: </label>
                          <input type="text" name="exercise-equipment" class="form-control col-sm-5 removeEquipmentInput" placeholder="Enter equipment needed">  
                        </div>`;

        if($('.removeEquipment').is(":hidden")){
            $('.removeEquipment').show();
        } else {
            if($('.removeEquipmentLabel').length == 0 && $('.removeRequipmentInput').length == 0){
                $('.removeEquipment').hide();
            }
        }

        $('.after-add-more').append(htmlToAdd);
    });

    $('.removeEquipment').click(function () {
        $('.removeEquipmentLabel').last().remove();
        $('.removeEquipmentInput').last().remove();

        if(!$('.removeEquipment').is(":hidden")){
            if($('.removeEquipmentLabel').length == 0 && $('.removeEquipmentInput').length == 0){
                $('.removeEquipment').hide();
            }
        }
    });
})(window.jQuery);