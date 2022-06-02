<template>
  <div>
    <div v-show="cart.length > 0">
      <table class="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in cart" :key="i">
            <td>{{ item.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.price }}</td>
            <td>
              <button @click="removeFromCart(item.id)" class="trash">
                <img src="/assets/trash.png" width="25" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="total">TOTAL: {{ getTotal() }}</div>
    </div>
    <div v-show="cart.length === 0">Tu carrito esta vacío</div>
  </div>
</template>

<script>
import { Product } from "../../models/product";

export default {
  name: "TableComponent",
  props: {
    cart: {
      type: Array[Product],
      required: true,
    },
  },
  methods: {
    getTotal() {
      var total = this.cart.reduce(function (res, item) {
        return res + item.price * item.quantity;
      }, 0);
      return this.getCurrency(total);
    },
    removeFromCart(productId) {
      this.$emit("remove-from-cart", productId);
    },
  },
};
</script>

<style scoped lang="less">
.trash {
  background-color: transparent;
  outline: none;
  border: none;
  border-radius: 5px;
  padding: 5px;

  &:hover,
  &:focus,
  &:active {
    background-color: #bebebe;
    outline: none;
  }
}

.total {
  float: right;
  font-size: 18px;
  font-weight: bold;
}
</style>
