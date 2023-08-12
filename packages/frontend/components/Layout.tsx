import Link from "next/link"; // Dynamic routing
import { eth } from "@state/eth"; // State management
import type { ReactElement } from "react"; // Types
import NextNProgress from "nextjs-progressbar"; // Navigation progress bar
import styles from "@styles/components/Layout.module.scss"; // Component styles

/**
 * Layout wrapper for application
 * @param {ReactElement} children to inject into content section
 * @returns {ReactElement} containing layout
 */
export default function Layout({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  return (
    <div>
      {/* Navigation progress bar */}
      <NextNProgress
        color="#127e83"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        options={{
          showSpinner: false,
        }}
      />

      {/* Top header component */}
      <Header />

      {/* Content */}
      <div className={styles.layout__content}>{children}</div>

      {/* Bottom footer component */}
      <Footer />
    </div>
  );
}

/**
 * Top header
 * @returns {ReactElement} top header component
 */
function Header(): ReactElement {
  // Collect auth state and unlock function
  const { address, unlock }: { address: null | string; unlock: Function } =
    eth.useContainer();

  return (
    <div className={styles.layout__header}>
      {/* Layout: left logo */}
      <div className={styles.layout__header_logo}>
        <Link href="/">
          <a>
            <img src="/vectors/logo.svg" alt="logo" width="35" height="35" />
          </a>
        </Link>
      </div>

      {/* Layout: right actions */}
      <div className={styles.layout__header_actions}>
        {/* Create button, redirect to /create */}
        <Link href="/create">
          <a>Create loan</a>
        </Link>

        {/* Authenticate wallet button */}
        <button onClick={() => unlock()}>
          {address ? (
            <>
              {/* Render address */}
              <span>
                {address.substr(0, 6) +
                  "..." +
                  address.slice(address.length - 4)}
              </span>

              {/* Render avatar */}
              {/* TODO: Replace with Rainbow Connect 
              <Jazzicon diameter={16} seed={jsNumberForAddress(address)} />
              */}
            </>
          ) : (
            // Else, if not unlocked, show prompt string
            "Unlock"
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Bottom footer
 * @returns {ReactElement} bottom footer component
 */
function Footer(): ReactElement {
  return (
    <div className={styles.layout__footer}>
      {/* Credits */}
      <span>
        Forking {" "}
        <a
          href="https://github.com/Anish-Agnihotri/pawnft/"
          target="_blank"
          rel="noopener noreferrer"
        >
          PawnNFT by Anish
        </a>
        {" "} as Lending Protol
        .
      </span>
    </div>
  );
}
