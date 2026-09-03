'use client';

import { useState } from 'react';

function formatBRL(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

export default function Simulator({ defaults }) {
  const [unitValue, setUnitValue] = useState(defaults.unitValue);
  const [unitsSold, setUnitsSold] = useState(defaults.unitsSold);
  const [commissionPct, setCommissionPct] = useState(defaults.commissionPct);
  const [participationPct, setParticipationPct] = useState(defaults.participationPct);

  const totalVGV = unitValue * unitsSold;
  const totalCommission = totalVGV * (commissionPct / 100);
  const earnings = totalCommission * (participationPct / 100);

  return (
    <div className="mp-simulator">
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
              min="1"
              max="10"
              step="0.5"
              value={commissionPct}
              onChange={(event) => setCommissionPct(Number(event.target.value))}
            />
          </div>

          <div className="mp-sim-field">
            <div className="mp-sim-field-value">
              <label htmlFor="sim-participation">Sua participação</label>
              <strong>{participationPct}%</strong>
            </div>
            <input
              id="sim-participation"
              type="range"
              min="5"
              max="30"
              step="1"
              value={participationPct}
              onChange={(event) => setParticipationPct(Number(event.target.value))}
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
