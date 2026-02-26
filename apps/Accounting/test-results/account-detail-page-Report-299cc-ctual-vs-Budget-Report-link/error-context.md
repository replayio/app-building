# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e5] [cursor=pointer]: FINANCEWEB
    - generic [ref=e6]:
      - button "Dashboard" [ref=e7] [cursor=pointer]
      - button "Accounts" [ref=e8] [cursor=pointer]
      - button "Transactions" [ref=e9] [cursor=pointer]
      - button "Reports" [ref=e10] [cursor=pointer]
      - button "Budgets" [ref=e11] [cursor=pointer]
    - generic [ref=e12]:
      - button "New Transaction" [ref=e13] [cursor=pointer]:
        - img [ref=e14]
        - text: New Transaction
      - generic [ref=e16]:
        - generic [ref=e17]: U
        - generic [ref=e18]: John Doe
      - button "Log Out" [ref=e19] [cursor=pointer]
  - generic [ref=e20]:
    - link "Home" [ref=e21] [cursor=pointer]:
      - /url: "#"
    - generic [ref=e22]: ">"
    - generic [ref=e23]: Accounts
  - paragraph [ref=e25]: Account not found.
```