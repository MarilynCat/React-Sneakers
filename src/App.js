import React from 'react';
import { Route, Routes } from 'react-router-dom';
import axios from 'axios';
import ContentLoader from "react-content-loader";
import Header from "./components/Header";
import Drawer from "./components/Drawer";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import Orders from "./pages/Orders";
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
            try { const cartResponse = await axios.get('https://64455fb0914c816083cd5839.mockapi.io/cart');
            // const favoritesResponse = await axios.get('https://64455fb0914c816083cd5839.mockapi.io/favorites');
            const itemsResponse = await axios.get('https://64455fb0914c816083cd5839.mockapi.io/items');

            setIsLoading(false);

            setItems(itemsResponse.data);
            setCartItems(cartResponse.data);
            // setFavorites(favoritesResponse.data);
            } catch (error) {
                alert('Ошибка при запросе данных ;(');
                console.error(error);
            }
        }

        fetchData();
    }, []);


    const onAddToCart = async (obj) => {
        try {
            const findItem = cartItems.find((item) => Number(item.parentId) === Number(obj.id));
            if (findItem) {
                setCartItems((prev) => prev.filter((item) => Number(item.parentId) !== Number(obj.id)));
                await axios.delete(`https://64455fb0914c816083cd5839.mockapi.io/cart/${findItem.id}`);
            } else {
                setCartItems((prev) => [...prev, obj]);
                const { data } = await axios.post('https://64455fb0914c816083cd5839.mockapi.io/cart', obj);
                setCartItems((prev) =>
                    prev.map((item) => {
                        if (item.parentId === data.parentId) {
                            return {
                                ...item,
                                id: data.id,
                            };
                        }
                        return item;
                    }),
                );
            }
        } catch (error) {
            alert('Ошибка при добавлении в корзину');
            console.error(error);
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
            <Drawer
                items={cartItems}
                onClose={() => setCartOpened(false)}
                onRemove={onRemoveItem}
                opened={cartOpened}
            />

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

                <Route path="/orders" element={
                    <Orders />}>
                </Route>
            </Routes>
        </div>
    </AppContext.Provider>
  );
}

export default App;
