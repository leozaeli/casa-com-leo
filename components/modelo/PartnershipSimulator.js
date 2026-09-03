'use client';

import { useState } from 'react';

function formatBRL(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

export default function PartnershipSimulator({ plans, defaults }) {
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0].id);
  const [unitValue, setUnitValue] = useState(defaults.unitValue);
  const [unitsSold, setUnitsSold] = useState(defaults.unitsSold);
  const [commissionPct, setCommissionPct] = useState(defaults.commissionPct);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];
  const participationPct = selectedPlan.pct;

  const totalVGV = unitValue * unitsSold;
  const totalCommission = totalVGV * (commissionPct / 100);
  const earnings = totalCommission * (participationPct / 100);

  return (
    <div className="mp-simulator">
      <div className="mp-plans-grid">
        {plans.map((plan) => {
          const isActive = plan.id === selectedPlanId;
          return (
            <button
              key={plan.id}
              type="button"
              className={`mp-plan-card mp-plan-selectable${isActive ? ' active' : ''}`}
              onClick={() => setSelectedPlanId(plan.id)}
              aria-pressed={isActive}
            >
              <span className="mp-plan-label">{plan.label}</span>
              <span className="mp-plan-pct">{plan.pct}%</span>
              <p>{plan.description}</p>
              {isActive && (
                <ul className="mp-plan-benefits">
                  {plan.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      <div className="mp-sim-grid">
        <div className="mp-sim-fields">
          <div className="mp-sim-field">
            <div className="mp-sim-field-value">
              <label htmlFor="sim-unit-value">Valor médio da unidade</label>
              <strong>{formatBRL(unitValue)}</strong>
            </div>
            <input
              id="sim-unit-value"
              type="range"
              min="150000"
              max="900000"
              step="10000"
              value={unitValue}
              onChange={(event) => setUnitValue(Number(event.target.value))}
            />
          </div>

          <div className="mp-sim-field">
            <div className="mp-sim-field-value">
              <label htmlFor="sim-units-sold">Unidades vendidas</label>
              <strong>{unitsSold}</strong>
            </div>
            <input
              id="sim-units-sold"
              type="range"
              min="1"
              max="80"
              step="1"
              value={unitsSold}
              onChange={(event) => setUnitsSold(Number(event.target.value))}
            />
          </div>

          <div className="mp-sim-field">
            <div className="mp-sim-field-value">
              <label htmlFor="sim-commission">Comissão do construtor</label>
              <strong>{commissionPct}%</strong>
            </div>
            <input
              id="sim-commission"
              type="range"
              min="2"
              max="6"
              step="0.5"
              value={commissionPct}
              onChange={(event) => setCommissionPct(Number(event.target.value))}
            />
          </div>

          <div className="mp-sim-field">
            <div className="mp-sim-field-value">
              <label htmlFor="sim-participation">Sua participação ({selectedPlan.label})</label>
              <strong>{participationPct}%</strong>
            </div>
            <input
              id="sim-participation"
              type="range"
              min="15"
              max="25"
              step="1"
              value={participationPct}
              disabled
              readOnly
              aria-label={`Participação travada em ${participationPct}% pelo plano ${selectedPlan.label}`}
            />
          </div>
        </div>

        <div className="mp-sim-output">
          <div className="mp-sim-output-row">
            <span>VGV total gerado</span>
            <strong>{formatBRL(totalVGV)}</strong>
          </div>
          <div className="mp-sim-output-row">
            <span>Comissão total do empreendimento</span>
            <strong>{formatBRL(totalCommission)}</strong>
          </div>
          <div className="mp-sim-highlight">
            <span>O que você ganha</span>
            <strong>{formatBRL(earnings)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
