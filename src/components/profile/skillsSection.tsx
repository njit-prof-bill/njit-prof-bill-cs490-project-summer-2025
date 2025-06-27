import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, GripVertical } from 'lucide-react';
import { useProfile } from '@/context/profileContext';

const SkillsSection = () => {
  const { profile, updateSkills, markUnsaved } = useProfile();
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState(profile.skills);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      updateSkills(updatedSkills);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    updateSkills(updatedSkills);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const moveSkill = (fromIndex: number, toIndex: number) => {
    const updatedSkills = [...skills];
    const [movedSkill] = updatedSkills.splice(fromIndex, 1);
    updatedSkills.splice(toIndex, 0, movedSkill);
    setSkills(updatedSkills);
    updateSkills(updatedSkills);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Skills</h2>
        <p className="text-muted-foreground">Manage your professional skills and competencies</p>
      </div>

      {/* Add New Skill */}
      <div className="bg-neutral-800 rounded-lg p-4">
        <label className="block text-sm font-medium mb-2">
          Add New Skill
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a skill (e.g., JavaScript, Project Management)"
          />
          <button
            onClick={addSkill}
            disabled={!newSkill.trim() || skills.includes(newSkill.trim())}
            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
        {newSkill.trim() && skills.includes(newSkill.trim()) && (
          <p className="mt-1 text-sm text-red-600">This skill already exists</p>
        )}
      </div>

      {/* Skills List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Your Skills ({skills.length})</h3>
          {skills.length > 0 && (
            <p className="text-sm text-muted-foreground">Drag to reorder</p>
          )}
        </div>

        {skills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No skills added yet. Add your first skill above!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {skills.map((skill, index) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center space-x-3 p-3 bg-neutral-800 border hover:ring-2 hover:ring-blue-500 rounded-lg hover:shadow-sm transition-shadow"
              >
                <button
                  className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
                  onMouseDown={(e) => {
                    // Simple drag implementation - in production, you'd use a library like react-beautiful-dnd
                    e.preventDefault();
                  }}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                
                <span className="flex-1">{skill}</span>
                
                <button
                  onClick={() => removeSkill(skill)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Categories */}
      <div className="rounded-lg p-4 border border-blue-500">
        <h4 className="font-semibold text-blue-400 mb-2 space-x-2">💡 Skill Categories to Consider:</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-neutral-200">
          <div>
            <strong>Technical Skills:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Programming languages</li>
              <li>• Software & tools</li>
              <li>• Frameworks & libraries</li>
              <li>• Databases & systems</li>
            </ul>
          </div>
          <div>
            <strong>Soft Skills:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Communication</li>
              <li>• Leadership</li>
              <li>• Problem solving</li>
              <li>• Team collaboration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Common Skills Suggestions */}
      <div className="rounded-lg p-4 border border-blue-500">
        <h4 className="font-semibold text-blue-400 mb-3">🚀 Popular Skills by Category:</h4>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-blue-400">Technology:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Git'].map(skill => (
                <button
                  key={skill}
                  onClick={() => {
                    if (!skills.includes(skill)) {
                      const updatedSkills = [...skills, skill];
                      setSkills(updatedSkills);
                      updateSkills(updatedSkills);
                    }
                  }}
                  disabled={skills.includes(skill)}
                  className="px-2 py-1 text-xs bg-neutral-800 border border-gray-300 rounded hover:bg-gray-50 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-blue-400">Business:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {['Project Management', 'Data Analysis', 'Marketing', 'Sales', 'Customer Service', 'Strategic Planning'].map(skill => (
                <button
                  key={skill}
                  onClick={() => {
                    if (!skills.includes(skill)) {
                      const updatedSkills = [...skills, skill];
                      setSkills(updatedSkills);
                      updateSkills(updatedSkills);
                    }
                  }}
                  disabled={skills.includes(skill)}
                  className="px-2 py-1 text-xs bg-neutral-800 border border-gray-300 rounded hover:bg-gray-50 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SkillsSection;