import React from 'react';
import { Route, Routes } from 'react-router-dom';
import axios from 'axios';
import ContentLoader from "react-content-loader"
import Header from "./components/Header";
import Drawer from "./components/Drawer";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import AppContext from "./context";

function App() {
    const [items, setItems] = React.useState([]);
    const [cartItems, setCartItems] = React.useState([]);
    const [favorites, setFavorites] = React.useState([]);
    const [searchValue, setSearchValue] = React.useState('');
    const[cartOpened, setCartOpened] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
            const cartResponse = await axios.get('https://64455fb0914c816083cd5839.mockapi.io/cart');
            // const favoritesResponse = await axios.get('https://64455fb0914c816083cd5839.mockapi.io/favorites');
            const itemsResponse = await axios.get('https://64455fb0914c816083cd5839.mockapi.io/items');

            setIsLoading(false);

            setItems(itemsResponse.data);
            setCartItems(cartResponse.data);
            // setFavorites(favoritesResponse.data);
        }

        fetchData();
    }, []);


    const onAddToCart = (obj) => {
        try {
            if (cartItems.find(item => Number(item.id) === Number(obj.id))) {
                axios.delete(`https://64455fb0914c816083cd5839.mockapi.io/cart/${obj.id}`);
                setCartItems(prev => prev.filter(item => Number(item.id) !== Number(obj.id)));
            } else {
                axios.post('https://64455fb0914c816083cd5839.mockapi.io/cart', obj);
                setCartItems(prev =>[...prev, obj]);
            }
        } catch (error) {

        }
    };

    const onRemoveItem = (id) => {
        axios.delete(`https://64455fb0914c816083cd5839.mockapi.io/cart/${id}`);
        setCartItems(prev => prev.filter(item => item.id !== id));
    };



        const onAddToFavorite = async (obj) => {
            try {
                if (favorites.find((favObj) => Number(favObj.id) === Number(obj.id))) {
                    axios.delete(`https://64455fb0914c816083cd5839.mockapi.io/favorites/${obj.id}`);
                    setFavorites((prev) => prev.filter((item) => Number(item.id) !== Number(obj.id)));
                } else {
                    const { data } = await axios.post(
                        'https://64455fb0914c816083cd5839.mockapi.io/favorites',
                        obj,
                    );
                    setFavorites((prev) => [...prev, data]);
                }
            } catch (error) {
                alert('Не удалось добавить в избранное');
                console.error(error);
            }
        };

    const onChangeSearchInput = (event) => {
        setSearchValue(event.target.value);
    }

    const isItemAdded = (id) => {
        return cartItems.some((obj) => Number(obj.parentId) === Number(id));
    };

  return (
    <AppContext.Provider value={{items, cartItems, favorites, isItemAdded, onAddToFavorite, setCartItems}}>
        <div className="wrapper clear">
            {cartOpened && <Drawer items={cartItems} onClose= {() => setCartOpened(false)} onRemove={onRemoveItem}/> }
            <Header onClickCart={() => setCartOpened(true)} />

            <Routes>
                <Route path="/" exact element={
                    <Home items={items}
                          cartItems={cartItems}
                          searchValue={searchValue}
                          setSearchValue={setSearchValue}
                          onChangeSearchInput={onChangeSearchInput}
                          onAddToFavorite={onAddToFavorite}
                          onAddToCart={onAddToCart}
                          isLoading={isLoading}
                    />}>
                </Route>

                <Route path="/favorites" element={
                    <Favorites />}>
                </Route>
            </Routes>
        </div>
    </AppContext.Provider>
  );
}

export default App;
