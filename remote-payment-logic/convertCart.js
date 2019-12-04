const fetch = require('node-fetch');

const mutationBulkInsertOrders = `
  mutation createOrderItems($objects: [order_items_insert_input!]!) {
    insert_order_items(objects: $objects) {
     affected_rows
    }
  }`;

const adminSecret = process.env.HASURA_SECRET;
const hasuraEndpoint = process.env.HASURA_URL;

module.exports = async function convertCart(cartItems, order, userId) {
  
  const orderItems = cartItems.map(cartItem => {
    const {title, img, description, price, store_id } = cartItem.item;
    return {
      title,
      img,
      description,
      price,
      store_id,
      quantity: cartItem.quantity,
      order_id: order.id,
      user_id: userId,
      status: "created"
    }
  });
  const qv = {objects: orderItems};
  console.log("what am I sending bulk insert order", qv);
  const wait = await fetch(hasuraEndpoint, {
    method: 'POST',
    body: JSON.stringify({query: mutationBulkInsertOrders, variables: qv}),
    headers: {'Content-Type': 'application/json', 'x-hasura-admin-secret': adminSecret},
  }).then(response => {
    if (response.ok) {
      return response.json()
    } else {
      throw new Error('something went wrong in bulk insert orders')
    }
  })
  .then(json => {
    const stringy = JSON.stringify(json);
    console.log("json Bulk Insert", stringy);
  }).catch((error)=> {
    console.log(error);
  });
  console.log("Finished bulk insert order", wait);
  return "ok";
}
