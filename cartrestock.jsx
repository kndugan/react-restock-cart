// simulate getting products from DataBase
const products = [
  { name: "Apples", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          // first data is from axios object, second data is from strapi object ** 
          dispatch({ type: "FETCH_SUCCESS", payload: result.data.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );

  console.log(`Rendering Products ===`, data);

  React.useEffect(() => {
    setItems(data);
  }, [data]);

  const [items, setItems] = React.useState(data);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  
  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items && items.length && items.filter((item) => item.attributes.name == name);
    if (item[0].attributes.instock === 0) 
    { alert("Sorry: Out of Stock"); 
    return; 
    } else  console.log(`add to Cart ${JSON.stringify(item)}`);
    setCart([...cart, ...item]);
    item[0].attributes.instock = item[0].attributes.instock -1; 
    console.log(item);
    //doFetch(query);
  };
  const deleteCartItem = (delindex) => {
    let newCart = cart.filter((item, i) => delindex != i);
    let target = cart.filter((item, index) => delindex == index);
    let newItems = items && items.length && items.map((item, index) => {
      if (item.attributes.name == target[0].attributes.name) item.attributes.instock = item.attributes.instock + 1;
      return item;
    })
    setCart(newCart);
    setItems(newItems);
  };
  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png", "bananas.png", "nuts.png"];

  let list = data && data.length && items.length && items.map((item, index) => {
    // let n = index + 1049;
    // let picurl = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <li key={index}>
        {/* <Image src={picurl} width={70} roundedCircle></Image> */}
        <Image className="myimg" src={photos[index % 6]} width={80} roundedCircle></Image>
        <Button className="productbutton" variant="primary" size="large">
        {item.attributes.name}  Cost ${item.attributes.cost}  Stock {item.attributes.instock}
        </Button>
        <input name={item.attributes.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });
  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {item.attributes.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          <Card.Body className="deletebutton">
            Remove from Cart: {item.attributes.name} from {item.attributes.country} ${item.attributes.cost}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.attributes.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.attributes.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  const restockProducts = (url) => {
    doFetch(query);
    let newItems = data.map((item) => {
      // let { name, country, cost, instock } = item;
      return item;
    });
    setItems([...items, ...newItems]);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
