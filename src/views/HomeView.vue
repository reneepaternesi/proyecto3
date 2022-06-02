<template>
  <b-container class="product-layout p-5">
    <b-row class="justify-content-center">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @delete-product="deleteProduct"
        :isAdmin="isAdmin"
      />
      <ProductCard
        v-show="isAdmin"
        :product="newProduct"
        @add-to-cart="addProduct"
      />
    </b-row>
  </b-container>
</template>

<script>
import ProductCard from "../components/products/ProductCard.vue";

export default {
  name: "HomeView",
  props: {
    products: [],
    isAdmin: Boolean,
  },
  data: () => ({
    newProduct: {
      id: "agregar-producto",
      name: "Nombre del Producto",
      price: 0,
      stock: 0,
      description: "Descripción del Producto",
      quantity: 0,
      size: 35,
      img: "https://i.imgur.com/4lw1ETN.png",
    },
  }),
  components: {
    ProductCard,
  },
  methods: {
    addProduct() {
      this.$emit("add-product", this.newProduct);
    },
    deleteProduct(id) {
      this.$emit("delete-product", id);
    },
  },
};
</script>
