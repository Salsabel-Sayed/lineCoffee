import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Product = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    description?: string;
     averageRating ?: number;
    type: string;
    weight: number;
    availableVariants?: {
        type: string;
        weights: {
            weight: number;
            price: number;
        }[];
    }[];// ✅ NEW
};
  

type RemoveArgs = { id: string; type?: string; weight?: number };
type UpdateArgs = { id: string; newQty: number; type?: string; weight?: number };
type CartContextType = {
    cartItems: Product[];
    addToCart: (product: Product) => void;
    removeFromCart: (args: RemoveArgs) => void;
    clearCart: () => void;
    updateQuantity: (args: UpdateArgs) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<Product[]>([]);

    const addToCart = (product: Product) => {
        const existing = cartItems.find(
            (p) =>
                p.id === product.id &&
                p.type === product.type &&
                p.weight === product.weight
        );

        if (existing) {
            // لو نفس المنتج بنفس النوع والوزن موجود → زود الكمية
            setCartItems((prevItems) =>
                prevItems.map((p) =>
                    p.id === product.id &&
                        p.type === product.type &&
                        p.weight === product.weight
                        ? { ...p, quantity: p.quantity + 1 }
                        : p
                )
            );
        } else {
            // منتج جديد أو نوع/وزن مختلف → أضفه للسلة
            setCartItems((prevItems) => [...prevItems, { ...product, quantity: 1 }]);
        }
    };


    const removeFromCart = ({ id, type, weight }: RemoveArgs) => {
        setCartItems((prev) =>
            prev.filter(
                (item) => !(item.id === id && item.type === type && item.weight === weight)
            )
        );
    };


    const clearCart = () => {
        setCartItems([]);
    };

    const updateQuantity = ({ id, newQty, type, weight }: UpdateArgs) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id && item.type === type && item.weight === weight
                    ? { ...item, quantity: newQty }
                    : item
            )
        );
    };


    return (
        <CartContext.Provider
            value={{ cartItems, addToCart, removeFromCart, clearCart, updateQuantity }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}
