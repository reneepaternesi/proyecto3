<template>
  <b-container class="product-layout p-5">
    <b-row class="justify-content-center">
      <div class="col-6">
        <img class="w-100" :src="productToCart.img" />
      </div>
      <div class="col-6">
        <h1 class="title" v-show="!isAdmin">{{ productToCart.name }}</h1>
        <div v-show="isAdmin" class="admin-section">
          <div class="text-left font-weight-bold">Nombre del Producto:</div>
          <b-form-input
            v-model="productToSave.name"
            v-bind:class="{
              'is-invalid':
                !validString(productToSave.name) &&
                productToSaveStatus.nameBlured,
            }"
            v-on:blur="productToSaveStatus.nameBlured = true"
          ></b-form-input>
          <b-form-invalid-feedback class="text-left">
            El nombre debe contener al menos 2 caracteres
          </b-form-invalid-feedback>
        </div>
        <div v-show="isAdmin" class="admin-section">
          <div class="text-left font-weight-bold">Imagen del Producto:</div>
          <b-form-input
            v-model="productToSave.img"
            v-bind:class="{
              'is-invalid':
                !validString(productToSave.img) &&
                productToSaveStatus.imgBlured,
            }"
            v-on:blur="productToSaveStatus.imgBlured = true"
          ></b-form-input>
          <b-form-invalid-feedback class="text-left">
            El nombre debe contener al menos 2 caracteres
          </b-form-invalid-feedback>
        </div>
        <p v-show="!isAdmin" class="description">
          {{ productToCart.description }}
        </p>
        <div v-show="isAdmin" class="admin-section">
          <div class="text-left font-weight-bold">
            Descripción del Producto:
          </div>
          <b-form-textarea
            id="textarea"
            v-model="productToSave.description"
            rows="3"
            max-rows="6"
            v-bind:class="{
              'is-invalid':
                !validString(productToSave.description) &&
                productToSaveStatus.descriptionBlured,
            }"
            v-on:blur="productToSaveStatus.descriptionBlured = true"
          ></b-form-textarea>
          <b-form-invalid-feedback class="text-left">
            La descriptión debe contener al menos 2 caracteres
          </b-form-invalid-feedback>
        </div>
        <p class="text-left">
          <strong>Cantidad Disponible: </strong
          ><span v-show="!isAdmin">{{ productToCart.stock }}</span>
          <b-form-input
            v-show="isAdmin"
            v-model="productToSave.stock"
            type="number"
            v-bind:class="{
              'is-invalid':
                !validNumber(productToSave.stock) &&
                productToSaveStatus.stockBlured,
            }"
            v-on:blur="productToSaveStatus.stockBlured = true"
          ></b-form-input>
          <b-form-invalid-feedback class="text-left">
            El stock debe ser una cantidad positiva o cero
          </b-form-invalid-feedback>
        </p>
        <b-row>
          <div class="col-6">
            <b-table striped hover :items="sizes"></b-table>
          </div>
          <div class="col-6">
            <div class="price" v-show="!isAdmin">
              Precio: {{ getCurrency(productToCart.price) }}
            </div>
            <div v-show="isAdmin" class="admin-section">
              <div class="text-left font-weight-bold">Precio del Producto:</div>
              <b-form-input
                v-model="productToSave.price"
                type="number"
                v-bind:class="{
                  'is-invalid':
                    !validNumber(productToSave.price) &&
                    productToSaveStatus.priceBlured,
                }"
                v-on:blur="productToSaveStatus.priceBlured = true"
              ></b-form-input>
              <b-form-invalid-feedback class="text-left">
                El precio debe ser una cantidad positiva
              </b-form-invalid-feedback>
            </div>
            <b-form-select
              v-model="productToCart.size"
              :options="getSizes(sizes)"
              class="sizes"
              required
              :disabled="!validPurchase()"
            >
            </b-form-select>
            <b-button
              v-show="!isAdmin"
              class="add-to-cart shadow"
              type="submit"
              :disabled="!validPurchase()"
              @click="addToCart"
              >{{
                productToCart.stock === 0 ||
                productToCart.quantity === productToCart.stock
                  ? "No Disponible"
                  : "Comprar"
              }}</b-button
            >
            <br /><br />
            <b-button
              v-show="isAdmin"
              class="add-to-cart shadow"
              type="submit"
              :disabled="!validChanges()"
              @click="updateProduct"
              >Actualizar Producto</b-button
            >
          </div>
        </b-row>
      </div>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: "ProductView",
  props: {
    id: String,
    product: {},
    sizes: [],
    isAdmin: Boolean,
  },
  data: () => ({
    productToCart: {},
    productToSave: {},
    productToSaveStatus: {
      nameBlured: false,
      desciptionBlured: false,
      stockBlured: false,
      priceBlured: false,
      imgBlured: false,
    },
  }),
  methods: {
    resetStatus() {
      this.productToSaveStatus.nameBlured = false;
      this.productToSaveStatus.descriptionBlured = false;
      this.productToSaveStatus.stockBlured = false;
      this.productToSaveStatus.priceBlured = false;
      this.productToSaveStatus.imgBlured = false;
    },
    validPurchase() {
      return (
        this.productToCart.stock > 0 &&
        this.productToCart.quantity < this.productToCart.stock
      );
    },
    validString(text) {
      return text?.length >= 2;
    },
    validNumber(price) {
      return price > 0;
    },
    addToCart() {
      this.$emit("add-to-cart", this.productToCart);
    },
    validChanges() {
      return (
        this.validString(this.productToSave.name) &&
        this.validString(this.productToSave.img) &&
        this.validString(this.productToSave.description) &&
        this.validNumber(this.productToSave.price) &&
        this.validNumber(this.productToSave.stock)
      );
    },
    updateProduct() {
      if (this.productToSave.id === "agregar-producto") {
        this.$emit("add-product", this.productToSave);
      } else {
        this.$emit("update-product", this.productToSave);
      }
    },
  },
  mounted() {
    this.productToCart = this.product;
    this.productToCart.size = 35;
    this.productToCart.quantity = 0;
    if (this.isAdmin) {
      this.productToSave = this.product;
    }
  },
};
</script>

<style scoped lang="less">
.title {
  text-shadow: 2px 2px 8px #6c757d;
  font-size: 50px;
  margin-bottom: 20px;
}

.description {
  text-align: justify;
}

.price {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.sizes {
  padding: 0 15px;
  margin-bottom: 20px;
}

.admin-section {
  margin-bottom: 20px;
}
</style>
