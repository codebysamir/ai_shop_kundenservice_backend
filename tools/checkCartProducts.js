import axios from "axios";
import { DynamicTool } from "langchain/tools"
import { z } from "zod";

const BACKEND_URL = process.env.BACKEND_URL

export const checkCartProducts = new DynamicTool({
  name: 'checkCartProducts',
  description: 'This function checks which, if any, products are in the cart and informs either the user or yourself (Swisscom Sales Consultant) about the status. \n 1. Only use this information for yourself, except the user asks for it.',
  func: async () => {
    const response = await axios.get(BACKEND_URL + '/api/cart/get')
    console.log(response.data)
    const cartItems = response.data.cartItems
    const productnames = cartItems?.map(prod => prod.product)
    let total = 0
    cartItems?.forEach(prod => total += +getNumber(prod.price))
    console.log(total)
    return `CartList: ${JSON.stringify(cartItems)}. Following products, "${Array.isArray(productnames) ? productnames.join(', ') : productnames}" for ${total} are in the Cart`
  }
})

function getNumber(string) {
  const flaotingNumberRegex = /^\d+\.?\d+$/
  const oneCharRegex = /[\d.]/
  if (isNaN(string)) {
    const charArray = [...string]
    const onlyNumArray = charArray.filter(char => oneCharRegex.test(char))
    const isNumber = parseFloat(onlyNumArray.join(''))  
    return isNumber
  } else {
    return string
  }
}