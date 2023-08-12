import axios from "axios"; // Axios requests
import { eth } from "@state/eth"; // State: ETH
import { loan } from "@state/loan"; // State: Loans
import { toast } from "react-toastify"; // Toast notifications
import Layout from "@components/Layout"; // Layout wrapper
import DatePicker from "react-datepicker"; // Datepicker
import LoanCard from "@components/LoanCard"; // Component: Loancard
import Inventory from "@components/Inventory"; // Component: Loancard
import styles from "@styles/pages/Create.module.scss"; // Component styles
import { ReactElement, useEffect, useState } from "react"; // State management
import { NextRouter, useRouter } from "next/dist/client/router"; // Next router
import inventoryMockData from './inventory_response.json';
// import { useDebounce } from 'usehooks';

/**
 * Selection states
 */
enum State {
  tokenizeAsset = -1,
  selectNFT = 0,
  setTerms = 1
}

export default function Create() {
  // Page navigation router
  const router: NextRouter = useRouter();

  // Global state
  const { address, unlock }: { address: string | null; unlock: Function } =
    eth.useContainer();
  const { createLoan }: { createLoan: Function } = loan.useContainer();

  // Current page state (Select / Set)
  const [state, setState] = useState<number>(State.tokenizeAsset);
  // Number of retrieved NFTs (used for pagination)
  const [numOSNFTs, setNumOSNFTs] = useState<number>(0);
  // List of ERC721 NFTs
  const [NFTList, setNFTList] = useState<Object[]>([]);
  // Loading status (for retrieval and buttons)
  const [loading, setLoading] = useState<boolean>(false);
  // Currently selected NFT details
  const [selected, setSelected] = useState<Object | null>(null);
  // Parameter: Interest to pay
  const [interest, setInterest] = useState<number>(5);
  // Parameter: Maximum amount to loan (bid ceiling)
  const [maxAmount, setMaxAmount] = useState<number>(3);
  // Parameter: Timestamp of loan completion
  const [loanCompleted, setLoanCompleted] = useState<number>(
    new Date().setDate(new Date().getDate() + 7)
  );

  const Cooldown = 300;

  // SteamID
  const [gamerTradelink, setGamerTradelink] = useState("");
  const [gamerTradelinkText, setGamerTradelinkText] = useState("");

  const [inventory, setInventory] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [tradeToken, setTradeToken] = useState("8nUPXs46");
  const [tradeOfferLink, setTradeOfferLink] = useState<String | null>(null);
  const [requireRefresh, setRequireRefresh] = useState(false);

  const [filter, setFilter] = useState("");
  // const debouncedFilter = useDebounce(filter, Cooldown);

  /**
   * Renders button based on current state
   * @returns {ReactElement} button
   */
  function renderActionButton() {
    if (!address) {
      // Not authenticated
      return <button onClick={() => unlock()}>Unlock</button>;
    } else if(state === State.tokenizeAsset && !gamerTradelink) {
      // Not connected to Steam
      return <button onClick={() => gamerTradelink("hello")} >Steam Connection Required</button>
    } else if(state === State.tokenizeAsset && !selectedAsset) {
      // Inventory shown and no item selected
      return <button disabled>Select an Asset to Tokenize</button>
    } else if(state === State.tokenizeAsset && tradeOfferLink) {
      // Bot already created the trade offer (final step)
      return <button onClick={() => {window.open(tradeOfferLink); setState(State.selectNFT)}}>Transfer "{selectedAsset.name}" to Tokenize</button>
    } else if(state === State.tokenizeAsset && !loading) {
      // Initiate trade offer and setLoading
      return <button onClick={() => requestTradeOffer(selectedAsset.id, address)}>Create Trade Offer</button>
    } else if(state === State.tokenizeAsset) {
      // Else
    } else if(state === State.selectNFT && selected) {
      // NFT selected
      return (
        <button onClick={() => setState(State.setTerms)}>Craft terms</button>
      );
    } else if (state === State.selectNFT) {
      // No NFT selected
      return <button disabled>Must select NFT</button>;
    } else if (
      state === State.setTerms &&
      (!interest || !maxAmount || !loanCompleted)
    ) {
      // Missing terms
      return <button disabled>Must enter terms</button>;
    } else if (state === State.setTerms && !loading) {
      // Ready to create loan
      return <button onClick={createLoanWithLoading}>Create loan</button>;
    } else if (state === State.setTerms) {
      // Pending loan creation
      return <button disabled>Creating loan...</button>;
    }
  }

  function updateGamerTradelinkText(evt: any) {
    setGamerTradelinkText(evt.target.value);
    const newTradelink = validateTradeLink(evt.target.value) ? evt.target.value : null;
    setGamerTradelink(newTradelink);
  }

  function validateTradeLink(link: string) {
    // TODO: Create better regex
    return new RegExp("partner").test(link);
  }

  /**
   * Filters array of all NFTs to only ERC721 schema qualifiers
   * @param {Object[]} assets all NFTs
   * @returns {Object[]} filtered ERC721 assets
   */
  function filter721(assets: Object[]): Object[] {
    return assets.filter(
      // Match for schema_name === "ERC721"
      (asset) => asset.asset_contract.schema_name === "ERC721"
    );
  }

  /**
   * Initiates the trade offer to tokenize the asset
   */
  async function requestTradeOffer(assetID: number, addr: string): Promise<void> {
    const requestData = {
      tradeURL: gamerTradelink, // Replace with your tradeURL
      itemIds: [selectedAsset.id], // Replace with your itemIds array
      walletAddress: address // Replace with your wallet address
    };

    const response = await axios.post('http://127.0.0.1:3011/api/v1/steam/init-trade', requestData);
    setTradeOfferLink(`https://steamcommunity.com/tradeoffer/${response.data.offerId}`);
  }

  /**
   * Loads the CS:GO Steam Inventory for a user
   * @param {String} The Steam Tradelink
   * @returns {Object[]} CS:GO Items that are permitted for lending
   */
  async function loadInventory(tradelink: String): Promise<void> {
      // setLoading(true);

      // 
      setInventory(inventoryMockData);

      // try {
      //   const response = await axios.get(`http://127.0.0.1:3011/items/${steamID}/`);
      //   const data = response.data;
      //   setInventory(data);
      // } catch (error) {
      //   toast.error("Error when fetching the inventory.");
      // }

      // setLoading(false);
  }

  /**
   * Collects ERC721 NFTs from OpenSea API
   */
  async function collectNFTs(): Promise<void> {
    try {
      const response = await axios.post('/api/tokenized_skins', { address: address });
      setNumOSNFTs(response.data.assets.length);
      setNFTList(response.data);
    } catch (error) {
      //toast.error("Error when collecting wallet NFT's.");
    }
  }

  /**
   * Creates a loan, with toggled loading
   */
  async function createLoanWithLoading(): Promise<void> {
    setLoading(true); // Toggle loading

    try {
      // Create loan
      const loanId = await createLoan(
        selected.asset_contract.address,
        selected.token_id,
        interest,
        maxAmount,
        loanCompleted,
        {
          imageURL: selected.image_preview_url ?? "",
          name: selected.name ?? "Untitled",
          description: selected.description ?? "No Description",
        }
      );
      // Prompt success
      toast.success("Successfully created loan! Redirecting...");
      // Reroute to loan page
      router.push(`/loan/${loanId}`);
    } catch {
      // On error, prompt
      toast.error("Error when attempting to create loan.");
    }

    setLoading(false); // Toggle loading
  }

  // Collect NFTs if authenticated
  useEffect(() => {
    if (address) collectNFTs();
  }, [address]);

  // Load the Steam inventory when connected to Steam
  useEffect(() => {
    if(gamerTradelink) loadInventory(gamerTradelink);
  }, [gamerTradelink]);

  return (
    <Layout>
      <div className="sizer">
        <div className={styles.create}>
          <h1>Create loan</h1>
          <p>Tokenize your skins and apply for a loan</p>

          <div className={styles.create__action}>
            {/* Action card phases */}
            <div className={styles.create__action_phase}>
            {[
              { state: State.tokenizeAsset, label: 'Tokenize', action: () => setState(State.tokenizeAsset) },
              { state: State.selectNFT, label: 'Create Loan', action: () => setState(State.selectNFT) },
              { state: State.setTerms, label: 'Confirm Terms' }
            ].map((item, index) => (
              <div
                key={index}
                className={state === item.state ? styles.create__action_active : undefined}
              >
                <span className={styles.ac} onClick={item.action}>{item.label}</span>
              </div>
            ))}
            </div>

            {/* Action card content */}
            <div className={styles.create__action_content}>
              {address ? (
                // If user is authenticated
                state === State.selectNFT ? (
                  // If the current state is NFT selection
                  <div className={styles.create__action_select}>
                    {NFTList.length > 0 ? (
                      // If > 0 NFTs exist in user wallet
                      <>
                        <div className={styles.create__action_select_list}>
                          {NFTList.map((nft, i) => {
                            // Render each NFT
                            return (
                              <LoanCard
                                key={i}
                                onClickHandler={() => setSelected(nft)}
                                selected={
                                  selected?.token_id === nft.token_id &&
                                  selected?.asset_contract?.address ===
                                    nft.asset_contract.address
                                }
                                imageURL={nft.image_preview_url}
                                name={nft.name ?? "Untitled"}
                                description={
                                  nft.description ?? "No description"
                                }
                                contractAddress={nft.asset_contract.address}
                                tokenId={nft.token_id}
                              />
                            );
                          })}
                        </div>

                        <button className={styles.reload} onClick={collectNFTs}>Refresh</button>
                      </>
                    ) : (
                      // If user does not own NFTs
                      !loading && <NoOwnedNFTs collectNFTs={collectNFTs} />
                    )}
                    {loading ? (
                      // If user NFTs are being loaded
                      <CreateLoadingNFTs />
                    ) : null}
                  </div>
                ) : state === State.tokenizeAsset ? (
                  !gamerTradelink ? <CreateUnauthenticatedSteam gamerTradelinkText={gamerTradelinkText} updateGamerTradelinkText={updateGamerTradelinkText}/> :
                  !inventory[0] ? <CreateLoadingSkins/> :
                  <div className={styles.skin_overview}>
                    <input autoFocus type="text" value={filter} onChange={(evt) => setFilter(evt.target.value)} placeholder="Type to filter"/>
                    <Inventory inventory={inventory} filter={filter} selected={selectedAsset} onSelectAsset={(asset: any) => {setSelectedAsset(asset)}} />
                  </div>
                ) : (
                  // Enable user input of terms
                  <div className={styles.create__action_terms}>
                    {/* Prefilled NFT Contract Address */}
                    <div>
                      <h3>NFT Contract Address</h3>
                      <p>Contract address for ERC721-compliant NFT.</p>
                      <input
                        type="text"
                        value={selected.asset_contract.address}
                        disabled
                      />
                    </div>

                    {/* Prefilled NFT ID */}
                    <div>
                      <h3>NFT ID</h3>
                      <p>Unique identifier for your NFT.</p>
                      <input type="text" value={selected.token_id} disabled />
                    </div>

                    {/* User input: Interest Rate */}
                    <div>
                      <h3>Interest Rate</h3>
                      <p>
                        Maximum interest rate you are willing to pay for these
                        terms.
                      </p>
                      <input
                        type="number"
                        step="0.25"
                        placeholder="5"
                        min="0.25"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                      />
                    </div>

                    {/* User input: max loan amount */}
                    <div>
                      <h3>Max Loan Amount</h3>
                      <p>
                        Maximum loaned Ether you are willing to pay interest
                        for.
                      </p>
                      <input
                        type="number"
                        placeholder="3"
                        step="0.01"
                        min="0"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                      />
                    </div>

                    {/* User input: Loan termination date */}
                    <div>
                      <h3>Loan Completion Date</h3>
                      <p>Date of loan termination.</p>
                      <DatePicker
                        selected={loanCompleted}
                        onChange={(date) => setLoanCompleted(date)}
                        showTimeSelect
                        minDate={new Date()}
                      />
                    </div>
                  </div>
                )
              ) : (
                <CreateUnauthenticated />
              )}
            </div>
          </div>

          {/* Render action buttons */}
          <div className={styles.create__button}>{renderActionButton()}</div>
        </div>
      </div>
    </Layout>
  );
}

/**
 * State when user has not authenticated with Steam
 * @returns {ReactElement}
 */
function CreateUnauthenticatedSteam({ gamerTradelinkText, updateGamerTradelinkText }): JSX.Element {
  return (
    <div className={styles.create__action_content_unauthenticated}>
      <img src="/vectors/unlock.svg" height="30px" alt="Unlock" />
      <h3>Connect with Steam</h3>
      <p>Please copy your <a href="https://steamcommunity.com/id/thermicwave/tradeoffers/privacy">trade link</a> to continue</p>
      <div className={styles.inputbox}>
        <input placeholder="https://steamcommunity.com/tradeoffer/new/?partner=179781986&token=8nUPXs46" value={gamerTradelinkText} onChange={updateGamerTradelinkText} />
      </div>
    </div>
  );
}

/**
 * State when user has not authenticated with a Wallet
 * @returns {ReactElement}
 */
function CreateUnauthenticated(): ReactElement {
  return (
    <div className={styles.create__action_content_unauthenticated}>
      <img src="/vectors/unlock.svg" height="30px" alt="Unlock" />
      <h3>Unlock wallet</h3>
      <p>Please connect your wallet to get started.</p>
    </div>
  );
}

/**
 * State when CS:GO assets are loading
 * @returns {ReactElement}
 */
function CreateLoadingSkins(): ReactElement {
  return (
    <div className={styles.create__action_loading}>
      <span>Loading Skins...</span>
    </div>
  );
}

/**
 * State when user's NFTs are loading
 * @returns {ReactElement}
 */
function CreateLoadingNFTs(): ReactElement {
  return (
    <div className={styles.create__action_loading}>
      <span>Loading NFTs...</span>
    </div>
  );
}

/**
 * State when user does not own any ERC721 NFTs
 * @returns {ReactElement}
 */
function NoOwnedNFTs({ collectNFTs }): JSX.Element {
  return (
    <div className={styles.create__action_content_unauthenticated}>
      <img src="/vectors/empty.svg" alt="Empty" height="30px" />
      <h3>No NFTs in wallet.</h3>
      <p>Please tokenize your skin before trying to create loan.</p>
      <button className={styles.reload} onClick={collectNFTs}>Refresh</button>
      
    </div>
  );
}