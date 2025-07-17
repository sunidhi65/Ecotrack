import { useState } from 'react';
import axios from 'axios';

function GoalSettings({ token }) {
  const [goal, setGoal] = useState('');
  const [goalType, setGoalType] = useState('weekly');

  const handleSave = async () => {
    try {
      await axios.put('/api/profile/goal', { goal, goalType }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Goal updated!');
    } catch (err) {
      alert('Failed to update goal');
    }
  };

  return (
    <div className="goal-settings">
      <h2>Set CO₂ Goal</h2>
      <input
        type="number"
        placeholder="Enter goal in kg"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />
      <select value={goalType} onChange={(e) => setGoalType(e.target.value)}>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <button onClick={handleSave}>Save Goal</button>
    </div>
  );
}

export default GoalSettings;
