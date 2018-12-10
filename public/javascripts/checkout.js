Stripe.setPublishableKey('pk_test_ikYvdPifz0UaZgkMszVGJQFO');
console.log('entered checkout.js')
var $form = $('#visa-form-wrap');

$form.submit(function(event) {
    $('#charge-error').addClass('invisible');
    $form.find('button').prop('disabled', true);

    Stripe.card.createToken({
        number: $('#card-number').val(),    
        cvc: $('#card-cvc').val(),
        exp_month: $('#card-expiry-month').val(),
        exp_year: $('#card-expiry-year').val(),
        name: $('#card-name').val()
      }, stripeResponseHandler);
      console.log('entered')
      
      return false;
});

function stripeResponseHandler(status, response) {
  
    if (response.error) { // Problem!
  
      // Show the errors on the form
      $('#charge-error').text(response.error.message);
      $('#charge-error').removeClass('invisible');
      $form.find('button').prop('disabled', false); // Re-enable submission
      console.log('Token was NOT created!')
  
    } else { // Token was created!
      console.log('Token was created!')
      // Get the token ID:
      var token = response.id;
  
      // Insert the token into the form so it gets submitted to the server:
      $form.append($('<input type="hidden" name="stripeToken" />').val(token));
      console.log('Token:' + token);
        
      // Submit the form:
      $form.get(0).submit(); 
    }
  }