import React from 'react';
import { Package, Search, ChevronRight, Activity, TrendingDown, TrendingUp, Grid, List as ListIcon, ShieldCheck } from 'lucide-react';

const ProductList = ({ products, text, fullView }) => {
  if (!fullView) {
    return (
      <div className="product-list-chat fade-in">
        <div className="chat-header">
           <div className="header-icon-box">
             <Grid size={18} />
           </div>
           <div className="header-text">
             <h3 className="inventory-title">Inventory Intelligence</h3>
             <span className="inventory-subtitle">{products.length} active SKUs in this view</span>
           </div>
        </div>
        
        {text && <p className="chat-intro-text">{text}</p>}

        <div className="chat-product-grid">
          {products.map((p) => {
            const isLow = p.quantityOnHand < p.reorderLevel;
            return (
              <div key={p.id} className="chat-p-card">
                 <div className="p-header">
                    <span className={`p-badge ${isLow ? 'low' : 'ok'}`}>{isLow ? 'Alert' : 'Active'}</span>
                    <span className="p-region">{p.region}</span>
                 </div>
                 <h4 className="p-title">{p.name}</h4>
                 <span className="p-cat">{p.category}</span>
                 
                 <div className="p-main-stats">
                    <div className="stat-group">
                       <span className="stat-label">Market Price</span>
                       <span className="stat-val primary">₹{Math.round(p.costPrice).toLocaleString()}</span>
                    </div>
                    <div className="stat-group align-right">
                       <span className="stat-label">Available</span>
                       <span className={`stat-val ${isLow ? 'danger' : 'success'}`}>{p.quantityOnHand}</span>
                    </div>
                 </div>

                 <div className="p-progress-container">
                    <div className="p-progress-track">
                       <div 
                         className={`p-progress-fill ${isLow ? 'danger' : 'success'}`} 
                         style={{ width: `${Math.min((p.quantityOnHand / (p.reorderLevel * 2 || 100)) * 100, 100)}%` }}
                       />
                    </div>
                 </div>
              </div>
            )
          })}
        </div>
        <style>{`
          .product-list-chat { 
            background: white; 
            border-radius: 20px; 
            padding: 1.5rem; 
            border: 1px solid var(--border-light); 
            width: 100%; 
            box-shadow: var(--shadow-lg); 
          }
          .chat-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
          .header-icon-box { 
            width: 40px; 
            height: 40px; 
            background: var(--primary-light); 
            color: var(--primary); 
            border-radius: 12px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
          }
          .inventory-title { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 0; }
          .inventory-subtitle { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
          .chat-intro-text { font-size: 0.95rem; color: #334155; margin-bottom: 1.5rem; font-weight: 500; line-height: 1.5; }
          
          .chat-product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
          .chat-p-card { 
            background: #f8fafc; 
            padding: 1.25rem; 
            border-radius: 16px; 
            border: 1px solid #f1f5f9; 
            display: flex; 
            flex-direction: column; 
            transition: transform 0.2s;
          }
          .chat-p-card:hover { transform: translateY(-2px); border-color: var(--primary); }
          
          .p-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
          .p-badge { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 100px; }
          .p-badge.ok { background: #dcfce7; color: #166534; }
          .p-badge.low { background: #fee2e2; color: #991b1b; }
          .p-region { font-size: 0.65rem; font-weight: 600; color: var(--text-light); }

          .p-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0; margin-bottom: 2px; }
          .p-cat { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem; display: block; }
          
          .p-main-stats { display: flex; justify-content: space-between; margin-bottom: 1rem; }
          .stat-group { display: flex; flex-direction: column; gap: 2px; }
          .stat-label { font-size: 0.65rem; color: var(--text-light); font-weight: 600; text-transform: uppercase; }
          .stat-val { font-size: 0.95rem; font-weight: 800; }
          .stat-val.primary { color: var(--primary); }
          .stat-val.success { color: var(--success); }
          .stat-val.danger { color: var(--danger); }
          .align-right { text-align: right; }

          .p-progress-container { margin-top: auto; }
          .p-progress-track { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
          .p-progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
          .p-progress-fill.success { background: var(--success); }
          .p-progress-fill.danger { background: var(--danger); }
        `}</style>
      </div>
    );
  }

  return (
    <div className="product-list-full fade-in">
      <div className="full-view-header">
        <div className="search-box">
          <Search size={18} color="var(--text-light)" />
          <input type="text" placeholder="Search enterprise product library..." />
        </div>
        <div className="header-buttons">
          <button className="export-action-btn secondary">Export CSV</button>
          <button className="export-action-btn primary">Enterprise Sync</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="inventory-table-premium">
          <thead>
            <tr>
              <th>Enterprise SKU</th>
              <th>Category</th>
              <th>Market Valuation</th>
              <th>Stock Integrity</th>
              <th>Performance Index</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isLow = p.quantityOnHand < p.reorderLevel;
              return (
                <tr key={p.id}>
                  <td>
                    <div className="product-identity">
                      <div className="identity-icon">
                        <Package size={18} />
                      </div>
                      <div className="identity-text">
                        <span className="sku-name">{p.name}</span>
                        <span className="sku-id">ID: {p.sku || p.productId}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="category-pill">{p.category}</span></td>
                  <td><span className="valuation-text">₹{Math.round(p.costPrice).toLocaleString()}</span></td>
                  <td>
                    <div className="stock-meter">
                      <div className="meter-track">
                        <div 
                          className={`meter-fill ${isLow ? 'critical' : 'stable'}`}
                          style={{ width: `${Math.min((p.quantityOnHand / (p.reorderLevel * 2 || 100)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="meter-label">{p.quantityOnHand} in stock</span>
                    </div>
                  </td>
                  <td>
                    <div className={`index-status ${isLow ? 'warning' : 'healthy'}`}>
                       <ShieldCheck size={14} />
                       <span>{isLow ? 'Restock Required' : 'Optimal'}</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        .product-list-full { display: flex; flex-direction: column; gap: 2rem; }
        .full-view-header { display: flex; justify-content: space-between; align-items: center; }
        .search-box { flex: 1; max-width: 450px; background: white; border: 1px solid var(--border-light); border-radius: 14px; padding: 0.85rem 1.25rem; display: flex; align-items: center; gap: 0.75rem; box-shadow: var(--shadow-sm); }
        .search-box input { border: none; outline: none; background: transparent; color: #0f172a; font-size: 1rem; flex: 1; font-weight: 500; }
        
        .header-buttons { display: flex; gap: 1rem; }
        .export-action-btn { 
          padding: 0.85rem 1.5rem; 
          border-radius: 12px; 
          font-weight: 700; 
          font-size: 0.9rem; 
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .export-action-btn.primary { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
        .export-action-btn.secondary { background: white; color: #334155; border: 1px solid var(--border-light); }
        .export-action-btn:hover { transform: translateY(-2px); }
        
        .table-wrapper { background: white; border-radius: 20px; overflow: hidden; border: 1px solid var(--border-light); box-shadow: var(--shadow-md); }
        .inventory-table-premium { width: 100%; border-collapse: collapse; }
        .inventory-table-premium th { text-align: left; padding: 1.5rem; background: #f8fafc; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-light); }
        .inventory-table-premium td { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        
        .product-identity { display: flex; align-items: center; gap: 1.25rem; }
        .identity-icon { width: 44px; height: 44px; background: #f1f5f9; color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .identity-text { display: flex; flex-direction: column; gap: 4px; }
        .sku-name { font-size: 1rem; font-weight: 700; color: #0f172a; }
        .sku-id { font-size: 0.75rem; color: var(--text-light); font-weight: 500; }
        
        .category-pill { font-size: 0.75rem; font-weight: 700; color: #475569; background: #f1f5f9; padding: 0.5rem 1rem; border-radius: 100px; display: inline-block; }
        .valuation-text { font-weight: 800; color: var(--primary); font-size: 1rem; }
        
        .stock-meter { display: flex; flex-direction: column; gap: 8px; width: 160px; }
        .meter-track { height: 8px; background: #f1f5f9; border-radius: 100px; overflow: hidden; }
        .meter-fill { height: 100%; border-radius: 100px; }
        .meter-fill.stable { background: var(--success); }
        .meter-fill.critical { background: var(--danger); }
        .meter-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
        
        .index-status { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 0.85rem; padding: 0.4rem 0.85rem; border-radius: 100px; width: fit-content; }
        .index-status.healthy { background: #f0fdf4; color: #166534; }
        .index-status.warning { background: #fff1f2; color: #991b1b; }
      `}</style>
    </div>
  );
};

export default ProductList;
