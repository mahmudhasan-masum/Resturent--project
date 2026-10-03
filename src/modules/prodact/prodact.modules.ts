import axios from "axios"
import type { iProdact } from "./prodact.type"
import Toastify from 'toastify-js'
import api from "../../../bit/api"

let productForm:HTMLElement|null = document.getElementById("product-form")
let productGrid= document.getElementById("product-grid")
let tableBody = document.getElementById("table-body")
let editProductForm:HTMLElement|null = document.getElementById("edit-product-form")
 





// productrender
async function productRender(){

try {
  
 let res = await api.get('/prodact');
 
    if(productGrid){
     productGrid.innerHTML=makeProductHtmlCode(res.data).homePage    
    }
    
    if(tableBody){
       tableBody.innerHTML=makeProductHtmlCode(res.data).dashboardPage 
    }

} catch (error) {
  console.log(error);
  
}
}
productRender();

// creat product 

productForm?.addEventListener("submit",async(e)=>{
e.preventDefault()
let formData = new FormData(productForm as HTMLFormElement)

let entries = Object.fromEntries (formData) as any



let validasForm = valiData(entries);

if(!validasForm){
  return
}
try {
   let res =await api.post('/prodact',validasForm)

if(res.status==201){

   Toastify({
  text: "product added successful",
  className: "success",
  style: {
    background: "linear-gradient(to right, #00b09b, #96c93d)",
  }
}).showToast();

(productForm as HTMLFormElement).reset();
}






} catch (error) {
  console.log(error);
    Toastify({
  text: "product added error",
  className: "error",
  style: {
    background: "linear-gradient(to right, #00b09b, #96c93d)",
  }
}).showToast();

}

})

// ==============Helper function======

function valiData(formData:iProdact){
   let condison=
   formData.name ==""
   ||!formData.image
   ||!formData.ratting
   ||Number(formData.price)<=0



if(condison){
Toastify({
  text: " please fill",
  className: "info",
}).showToast();
return null;
}

return formData
}


tableBody?.addEventListener("click", async (event) => {

  const target = event.target;

  if (!(target instanceof Element)) return;

  const deletBtn = target.closest(".delete-product");

  if (!deletBtn) return;

 let deleteProductId = (deletBtn as HTMLElement).dataset.id;
 
let conparmDelete= confirm("are you sure you delete parmanetly")


if(!conparmDelete)return;

let deletProduct = await api.delete(`/prodact/${deleteProductId}`);

if(deletProduct.status==200){
Toastify({
  text: "product remove successful",
  className: "error",
  style: {
    background: "linear-gradient(to right, #00b09b, #96c93d)",
  }
}).showToast();
productRender();
}

console.log(deletProduct);

 

});

// ============edit product========
if(editProductForm){

  // console.log("hello edit page");


  let searchParams= new URLSearchParams(window.location.search)

  let productId = searchParams.get("productid")

  if(productId){

async function getData(){

let respons = await api.get(`/prodact/${productId}`);


for(let field in respons.data){
console.log(field);
(document.querySelector(`[name="${field}"]`)as HTMLInputElement).value =respons.data[field];

}




// (document.querySelector(`[name="id"]`)as HTMLInputElement).value =respons.data.id;
// (document.querySelector(`[name="name"]`)as HTMLInputElement).value =respons.data.name;
// (document.querySelector(`[name="price"]`)as HTMLInputElement).value =respons.data.price;
// (document.querySelector(`[name="ratting"]`)as HTMLInputElement).value =respons.data.ratting;
// (document.querySelector(`[name="image"]`)as HTMLInputElement).value =respons.data.image;



 }
getData()

  }
  
}

editProductForm?.addEventListener('submit', async (event)=>{
event.preventDefault()


let formData = new FormData(editProductForm as HTMLFormElement)

let entries = Object.fromEntries (formData) as any



let validasForm = valiData(entries);

if(!validasForm){
  return
}
let searchParams= new URLSearchParams(window.location.search)

  let productId = searchParams.get("productid")

  if(productId){

try {
 
let {id,...updeteData}= validasForm

   let res = await api.put(`/prodact/${productId}`,updeteData)

if(res.status==200){

   Toastify({
  text: "product update successful",
  className: "success",
  style: {
    background: "linear-gradient(to right, #00b09b, #96c93d)",
  }
}).showToast();

window.location.replace("/desboud")
}






} catch (error) {
  console.log(error);
    Toastify({
  text: "product added error",
  className: "error",
  style: {
    background: "linear-gradient(to right, #00b09b, #96c93d)",
  }
}).showToast();

}


  }



})





function makeProductHtmlCode(arr:iProdact[]){

 let homePage ="";
 let dashboardPage ="";

 arr.forEach((item,index)=>{


  homePage += `
      
       <div
        class="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      >

        <!-- Product Image -->
        <div class="h-64 overflow-hidden">
          <img
            src="./src/assets/image/fode/${item.image}"
            alt=""
            class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        <!-- Product Content -->
        <div class="p-6">

          <h3 class="text-xl font-semibold text-gray-900">
            ${item.name}
          </h3>

          <!-- Rating & Price -->
         ${rettingCount(item.ratting)}
            <p class="text-xl font-bold text-gray-900">
              ${item.price}
            </p>

          </div>

          <!-- Add To Cart -->
          <button
          data-id="${item.id}"
            type="button"
            class="mt-6 w-full add-to-cart rounded-xl bg-[#F0A500] py-3.5 font-semibold text-white transition duration-300 hover:bg-[#d99000]"
          >
            Add to Cart
          </button>

        </div>
      </div>

      
      `;

dashboardPage+=`<tr class="hover:bg-gray-50">

<td class="px-6 py-4">
          
        ${index+1}
        </td>


        <td class="px-6 py-4">
          <img
            src="./src/assets/image/fode/${item.image}"
            alt="Burger"
            class="h-14 w-14 rounded-lg object-cover"
          />
        </td>

        <td class="px-6 py-4 font-medium text-gray-800">
            ${item.name}
        </td>

        <td class="px-6 py-4 text-gray-600">
        ${item.price}
        </td>

        <td class="px-6 py-4">
          <span class="rounded-full  px-3 py-1 text-yellow-700">
            ${rettingCount(item.ratting)}
          </span>
        </td>

        <td class="px-6 py-4">
          <div class="flex gap-2">
            <a href="edit-product?productid=${item.id}"
              class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Edit
            </a>

            <button
            data-id="${item.id}"
              class="rounded-md delete-product bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
`


 })



function rettingCount(n:number){

  let starts ="";

  for(let i=0; i<= 4; i++){

    if(n > i){
       starts +=`<span class="text-[#F0A500]">★</span>`
    }else{starts +=`<span class="text-gray-500">★</span>`}
    
  }
  return `<div class="flex items-center gap-1 text-xl"> ${starts}</div>`
}


 return {
  homePage:homePage,
  dashboardPage:dashboardPage,
 };
}