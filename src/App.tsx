import { observer } from 'mobx-react-lite'
import { transactionStore } from './models/TransactionStore'
import { loadCSVFromFile } from './utils/csvParser'
import './App.css'

const App = observer(() => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const transactions = await loadCSVFromFile(file)
      transactionStore.clearTransactions()
      transactions.forEach(t => transactionStore.addTransaction(t))
      console.log(`Loaded ${transactions.length} transactions`)
    } catch (error) {
      console.error('Error loading CSV:', error)
      alert('Error loading CSV file. Please check the console.')
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Budget Tracker</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload}
          style={{ marginRight: '10px' }}
        />
        <button onClick={() => transactionStore.clearTransactions()}>
          Clear All
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '15px', 
        marginBottom: '20px' 
      }}>
        <div style={{ padding: '15px', background: '#f0f0f0', borderRadius: '5px' }}>
          <h3 style={{ margin: '0 0 5px 0' }}>Total Transactions</h3>
          <p style={{ fontSize: '24px', margin: 0 }}>{transactionStore.transactionCount}</p>
        </div>
        <div style={{ padding: '15px', background: '#e8f5e9', borderRadius: '5px' }}>
          <h3 style={{ margin: '0 0 5px 0' }}>Total Income</h3>
          <p style={{ fontSize: '24px', margin: 0, color: '#2e7d32' }}>
            ${transactionStore.totalIncome.toFixed(2)}
          </p>
        </div>
        <div style={{ padding: '15px', background: '#ffebee', borderRadius: '5px' }}>
          <h3 style={{ margin: '0 0 5px 0' }}>Total Expenses</h3>
          <p style={{ fontSize: '24px', margin: 0, color: '#c62828' }}>
            ${transactionStore.totalExpenses.toFixed(2)}
          </p>
        </div>
        <div style={{ padding: '15px', background: '#e3f2fd', borderRadius: '5px' }}>
          <h3 style={{ margin: '0 0 5px 0' }}>Net Total</h3>
          <p style={{ 
            fontSize: '24px', 
            margin: 0,
            color: transactionStore.netTotal >= 0 ? '#2e7d32' : '#c62828'
          }}>
            ${transactionStore.netTotal.toFixed(2)}
          </p>
        </div>
      </div>

      {transactionStore.transactionCount > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            background: 'white'
          }}>
            <thead>
              <tr style={{ background: '#333', color: 'white' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Institution</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Account</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactionStore.sortedTransactions.map((transaction) => (
                <tr 
                  key={transaction.id}
                  style={{ 
                    borderBottom: '1px solid #ddd',
                    opacity: transaction.isHidden ? 0.5 : 1
                  }}
                >
                  <td style={{ padding: '10px' }}>{transaction.formattedDate}</td>
                  <td style={{ padding: '10px' }}>{transaction.description}</td>
                  <td style={{ padding: '10px', fontSize: '0.9em' }}>{transaction.institution}</td>
                  <td style={{ padding: '10px', fontSize: '0.9em' }}>{transaction.account}</td>
                  <td style={{ padding: '10px', fontSize: '0.9em' }}>{transaction.category}</td>
                  <td 
                    style={{ 
                      padding: '10px', 
                      textAlign: 'right',
                      color: transaction.isIncome ? '#2e7d32' : '#c62828',
                      fontWeight: 'bold'
                    }}
                  >
                    {transaction.formattedAmount}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontSize: '0.85em' }}>
                    {transaction.isPending && <span style={{ 
                      padding: '2px 6px', 
                      background: '#fff3cd', 
                      borderRadius: '3px',
                      marginRight: '4px'
                    }}>Pending</span>}
                    {transaction.isHidden && <span style={{ 
                      padding: '2px 6px', 
                      background: '#d3d3d3', 
                      borderRadius: '3px' 
                    }}>Hidden</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {transactionStore.transactionCount === 0 && (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          background: '#f5f5f5', 
          borderRadius: '5px' 
        }}>
          <p style={{ fontSize: '18px', color: '#666' }}>
            No transactions loaded. Upload a CSV file to get started.
          </p>
        </div>
      )}
    </div>
  )
})

export default App
