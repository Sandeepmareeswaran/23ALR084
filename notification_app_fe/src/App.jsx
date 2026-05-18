import { useEffect, useState } from 'react';
import './App.css';
import api from './services/api';
import { logFrontendEvent } from './services/logger';

function App() {
  const [userId, setUserId] = useState('u1001');
  const [type, setType] = useState('Email');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [queryUserId, setQueryUserId] = useState('u1001');
  const [analyticsType, setAnalyticsType] = useState('');
  const [recentList, setRecentList] = useState([]);
  const [unreadList, setUnreadList] = useState([]);
  const [analyticsList, setAnalyticsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  async function loadData(currentUserId, currentAnalyticsType) {
    setIsLoading(true);
    setErrorText('');

    try {
      const recentResponse = await api.get('/notifications/recent?limit=10');
      const unreadResponse = await api.get(`/notifications/unread?userId=${encodeURIComponent(currentUserId)}`);

      let analyticsUrl = '/notifications/analytics';
      if (currentAnalyticsType) {
        analyticsUrl += `?type=${encodeURIComponent(currentAnalyticsType)}`;
      }
      const analyticsResponse = await api.get(analyticsUrl);

      setRecentList(recentResponse.data.data || []);
      setUnreadList(unreadResponse.data.data || []);
      setAnalyticsList(analyticsResponse.data.data || []);

      await logFrontendEvent({
        level: 'info',
        packageName: 'page',
        message: 'Dashboard loaded',
      });
    } catch (error) {
      const text = error?.response?.data?.error || error.message || 'Cannot load data';
      setErrorText(text);
    }

    setIsLoading(false);
  }

  async function onSend(event) {
    event.preventDefault();

    setIsLoading(true);
    setErrorText('');

    try {
      await api.post('/notifications/send', {
        userId,
        type,
        title,
        message,
      });

      setTitle('');
      setMessage('');

      await logFrontendEvent({
        level: 'info',
        packageName: 'component',
        message: 'Notification created from UI',
      });

      await loadData(queryUserId, analyticsType);
    } catch (error) {
      const text = error?.response?.data?.error || error.message || 'Cannot send notification';
      setErrorText(text);
    }

    setIsLoading(false);
  }

  async function onMarkRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      await loadData(queryUserId, analyticsType);
    } catch (error) {
      const text = error?.response?.data?.error || error.message || 'Cannot mark as read';
      setErrorText(text);
    }
  }

  useEffect(() => {
    loadData(queryUserId, analyticsType);
  }, []);

  return (
    <div className="main-container text-white">
      <h1 className="hero-heading hero-heading-gradient">Notification App</h1>

      <form className="card border-4 border-zinc-700" onSubmit={onSend}>
        <h2 className="hero-subheading hero-subheading-gradient">Send Notification</h2>

        <label>User ID</label>
        <input className="input-card" value={userId} onChange={(e) => setUserId(e.target.value)} required />

        <label>Type</label>
        <select className="input-card" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Email">Email</option>
          <option value="SMS">SMS</option>
          <option value="Push">Push</option>
        </select>

        <label>Title</label>
        <input className="input-card" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Message</label>
        <textarea className="input-card" value={message} onChange={(e) => setMessage(e.target.value)} required />

        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Please wait...' : 'Send'}
        </button>
      </form>

      <div className="card">
        <h2 className="hero-subheading hero-subheading-gradient">Filters</h2>
        <label>Query User ID</label>
        <input className="input-card" value={queryUserId} onChange={(e) => setQueryUserId(e.target.value)} />

        <label>Analytics Type</label>
        <select className="input-card" value={analyticsType} onChange={(e) => setAnalyticsType(e.target.value)}>
          <option value="">All</option>
          <option value="Email">Email</option>
          <option value="SMS">SMS</option>
          <option value="Push">Push</option>
        </select>

        <button type="button" onClick={() => loadData(queryUserId, analyticsType)} className="btn-primary">
          Reload
        </button>
      </div>

      {errorText ? <p className="error">{errorText}</p> : null}

      <div className="card">
        <h2 className="hero-subheading hero-subheading-gradient">Unread Notifications ({unreadList.length})</h2>
        {unreadList.length === 0 ? <p>No unread notifications</p> : null}
        {unreadList.map((item) => (
          <div key={item.id} className="item">
            <p><b>{item.title}</b></p>
            <p>{item.message}</p>
            <p>{item.type} | {item.userId}</p>
            <button type="button" onClick={() => onMarkRead(item.id)} className="btn-primary">
              Mark Read
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="hero-subheading hero-subheading-gradient">Recent Notifications</h2>
        {recentList.length === 0 ? <p>No records</p> : null}
        {recentList.map((item) => (
          <div key={item.id} className="item">
            <p><b>{item.title}</b></p>
            <p>{item.message}</p>
            <p>{item.type} | {new Date(item.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="hero-subheading hero-subheading-gradient">Analytics</h2>
        {analyticsList.length === 0 ? <p>No records</p> : null}
        {analyticsList.map((row) => (
          <div key={row.type} className="item">
            <p><b>{row.type}</b></p>
            <p>Total: {row.total}</p>
            <p>Unread: {row.unread}</p>
            <p>Latest: {row.latest ? new Date(row.latest).toLocaleString() : '-'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;


