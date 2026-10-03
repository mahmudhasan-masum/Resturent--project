export type iCart = {
    id: string;
    name: string;
    price: number;
   
    image: string;
    quantity: number;
    totalPrice: number;
  };

  export type iCartStore = {
    data: iCart[];
    
    totalPrice: number;
  }