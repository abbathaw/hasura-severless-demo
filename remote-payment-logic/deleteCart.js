const fetch = require('node-fetch');

const mutationBulkDeleteCartItems = `
  mutation delete_cart_items($objects: [uuid!]!) {
    delete_cart_items(where: {id: {_in: $objects}}) {
     affected_rows
    }
  }`;

const adminSecret = process.env.HASURA_SECRET;
const hasuraEndpoint = process.env.HASURA_URL;

module.exports = async function deleteCart(cartItems) {
  
  const cartItemsToDelete = cartItems.map(cartItem => {
    return cartItem.id
  });
  const qv = {objects: cartItemsToDelete};
  console.log("what am I sending bulk delete", qv);
  const wait = await fetch(hasuraEndpoint, {
    method: 'POST',
    body: JSON.stringify({query: mutationBulkDeleteCartItems, variables: qv}),
    headers: {'Content-Type': 'application/json', 'x-hasura-admin-secret': adminSecret},
  }).then(response => {
    if (response.ok) {
      return response.json()
    } else {
      throw new Error('something went wrong in bulk delete cart')
    }
  })
  .then(json => {
    console.log("json Bulk delete", JSON.stringify(json));
  }).catch((error)=> {
    console.log(error);
  });
  console.log("Finished bulk delete cart", wait);
  return "ok";
}
