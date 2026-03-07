import React from 'react';
import AgentCard from './AgentCard';

const AgentGrid = ({ agents, onCardClick }) => {
    return (
        <div className="
      grid gap-8
      grid-cols-1
      md:grid-cols-2
      lg:grid-cols-4
      auto-rows-fr
    ">
            {agents.map((agent, index) => (
                <AgentCard
                    key={index}
                    icon={agent.icon}
                    title={agent.title}
                    description={agent.description}
                    features={agent.features}
                    status={agent.status}
                    onClick={() => onCardClick && onCardClick(agent)}
                />
            ))}
        </div>
    );
};

export default AgentGrid;
