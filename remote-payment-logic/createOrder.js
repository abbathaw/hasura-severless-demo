const fetch = require('node-fetch');
const stripe = require('./stripe');

const mutationInsertOrder = `
  mutation createOrder($charge: String!, $paid: Boolean, $total: Int!, $userId: uuid!) {
    insert_orders(objects: [{charge: $charge, paid: $paid, total: $total, user_id: $userId}]) {
      returning {
        id
      }
    }
  }`;

const adminSecret = process.env.HASURA_SECRET;
const hasuraEndpoint = process.env.HASURA_URL;

module.exports = async function createAnOrder(cartItems, stripeToken, userId) {
  //recalculate amount
  const amount = cartItems.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity,
      0
  );
  console.log(`Going to charge for a total of ${amount}`);
  
  const charge = await stripe.charges.create({
    amount,
    currency: 'USD',
    source: stripeToken,
  });
  
  let orderId = null;
  const qv = {charge:charge.id, paid: true, total: amount, userId: userId};
  console.log("What I'm sending insert order", qv);
  await fetch(hasuraEndpoint, {
    method: 'POST',
    body: JSON.stringify({query: mutationInsertOrder, variables: qv}),
    headers: {'Content-Type': 'application/json', 'x-hasura-admin-secret': adminSecret},
  }).then(response => response.json())
  .then(json => {
    console.log("json insert order", JSON.stringify(json));
    orderId = json.data.insert_orders.returning[0];
  });
  
  return orderId;
};
