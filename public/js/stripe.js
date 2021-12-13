import axios from 'axios';

const stripe = Stripe('pk_test_51K68pZSIz2g01x24yEqpXWHXDkk5BQMGuTuQRDkaKZ674cU3pDf1U9JVpvfi7NvRhNtfQ6SdwZrCsU80E4Nrt2UZ00U4BYOVd3');

export const bookTour = async tourId => {
    // 1) Get checkout session from API
    const session = await axios.get(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
    // 2) Create the checkout form + process or charge the credit card
};