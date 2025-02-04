import { useState, useEffect ,FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import styles from './home.module.css';
import { BsSearch } from 'react-icons/bs';

export interface CoinProps {
  id: string;
  name: string;
  symbol: string;
  priceUsd: string;
  vwap24Hr: string;
  changePercent24Hr: string;
  suplly: string;
  maxSupply: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  explorer: string;
  // Valores formatados pós coleta de dados da API
  formatedPrice?: string;
  formatedMarket?: string;
  formatedVolume?: string;
}

interface DataProps {
  data: CoinProps[];
}

export function Home() {

  const [input, setInput] = useState("");
  const [coins, setCoins] = useState<CoinProps[]>([]);
  const [offset, setOffset] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getData();
  }, [offset])

  async function getData() {
    fetch(`https://api.coincap.io/v2/assets?limit=10&offset=${offset}`)
    .then(response => response.json())
    .then((data: DataProps) => {
      const coinsData = data.data

      const price = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      })

      const priceCompact = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact"
      })

      const formatedResult = coinsData.map((item) => {
        const formated = {
          ...item,
          formatedPrice: price.format(Number(item.priceUsd)),
          formatedMarket: priceCompact.format(Number(item.marketCapUsd)),
          formatedVolume: priceCompact.format(Number(item.volumeUsd24Hr))
        }

        return formated;
      })

      const listCoins = [...coins, ...formatedResult]
      setCoins(listCoins)
    })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if(input === "") return ;

    navigate(`detail/${input}`)
    
    setInput("");
  }

  function handleGetMore() {
    if(offset === 0) {
      setOffset(10)
      return;
    }

    setOffset(offset + 10)
  }

  return (
    <main className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder='Digite o nome da moeda... Ex: Bitcoin'  
          value={input}
          onChange={ (e) => setInput(e.target.value) }
        />

        <button type='submit'>
          <BsSearch size={30} color='#FFF'/>
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th scope='coluna'>Moeda</th>
            <th scope='coluna'>Valor de Mercado</th>
            <th scope='coluna'>Preço</th>
            <th scope='coluna'>Volume</th>
            <th scope='coluna'>Mudança em 24h</th>
          </tr>
        </thead>

        <tbody id='tbody'>
          {coins.length > 0 && coins.map((item) => (
            <tr className={styles.tr} key={item.id}>

              <td className={styles.tdLabel} data-label="moeda">
                <div className={styles.name}>
                  <img 
                    className={styles.logo}
                    src={`https://assets.coincap.io/assets/icons/${item.symbol.toLowerCase()}@2x.png`} 
                    alt="Logo Cripto" 
                  />

                  <Link to={`/detail/${item.id}`}>
                    <span>{item.name}</span> | {item.symbol}
                  </Link>
                </div>
              </td>

              <td className={styles.tdLabel} data-label="Valor Mercado">
                {item.formatedMarket}
              </td>

              <td className={styles.tdLabel} data-label="Preço">
                {item.formatedPrice}
              </td>

              <td className={styles.tdLabel} data-label="Volume">
                {item.formatedVolume}
              </td>

              <td className={Number(item.changePercent24Hr) > 0 ? styles.tdProfit : styles.tdLoss} data-label="Mudança 24h">
                <span>{Number(item.changePercent24Hr).toFixed(3)}</span>
              </td>

          </tr>
          ))}
        </tbody>
      </table>

      <button className={styles.buttonMore} onClick={handleGetMore}>Carregar Mais</button>
    </main>
  )
}

export default Home;
