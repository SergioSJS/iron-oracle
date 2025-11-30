import { useState, useEffect } from 'react';
import { useGameData } from './hooks/useGameData';
import { useScreenSize } from './hooks/useScreenSize';
import { Header } from './components/Header/Header';
import { AskTheOracle } from './components/AskTheOracle/AskTheOracle';
import { OracleNavigation } from './components/OracleNavigation/OracleNavigation';
import { RollLog } from './components/RollLog/RollLog';
import { ResultModal } from './components/Modals/ResultModal';
import { LogModal } from './components/Modals/LogModal';
import { findAskTheOracleCollection, extractAskTheOracleTables, filterOtherOracles } from './utils/oracleDataUtils';
import './styles/index.css';

function App() {
  const {
    gameMode,
    setGameMode,
    logs,
    setLogs,
    currentRuleset,
    rollOracle,
    findOracleById,
    rollMultipleOracles,
    selectedRegion,
    setSelectedRegion
  } = useGameData();

  const [allGroupsOpen, setAllGroupsOpen] = useState(() => {
    const saved = localStorage.getItem('allGroupsOpen');
    return saved !== null ? saved === 'true' : false;
  });
  const [showLogModal, setShowLogModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [autoShowModal, setAutoShowModal] = useState(() => {
    const saved = localStorage.getItem('autoShowModal');
    return saved !== null ? saved === 'true' : true;
  });
  const { isSmallScreen } = useScreenSize();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verificar preferência salva ou usar dark como padrão
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? saved === 'true' : true;
  });

  // Handler para rolar novamente a partir do log
  const handleRollAgain = (oracleId: string) => {
    const oracle = findOracleById(oracleId);
    if (oracle) {
      rollOracle(oracle.name, oracle);
    }
  };

  // Handler para clicar em oráculo no texto
  const handleOracleClick = (oracleId: string) => {
    const oracle = findOracleById(oracleId);
    if (oracle) {
      rollOracle(oracle.name, oracle);
    }
  };

  // Handler para limpar o log
  const handleClearLog = () => {
    setLogs([]);
  };

  // Handler para colapsar/expandir todos os grupos
  const handleToggleAllGroups = () => {
    const newState = !allGroupsOpen;
    setAllGroupsOpen(newState);
    localStorage.setItem('allGroupsOpen', String(newState));
    
    // Manipular diretamente todos os elementos details
    requestAnimationFrame(() => {
      const allDetails = document.querySelectorAll('.oracle-details');
      allDetails.forEach((detail) => {
        (detail as HTMLDetailsElement).open = newState;
      });
    });
  };

  // Fechar modais quando a tela cresce
  useEffect(() => {
    if (!isSmallScreen) {
      setShowLogModal(false);
      setShowResultModal(false);
    }
  }, [isSmallScreen]);

  // Mostrar modal de resultado automaticamente quando uma nova rolagem é feita
  useEffect(() => {
    // No mobile sempre mostra, no desktop só se o switch estiver ativo
    if ((isSmallScreen || autoShowModal) && logs.length > 0) {
      setShowResultModal(true);
    }
  }, [logs.length, autoShowModal, isSmallScreen]);

  // Salvar preferência de modal automático
  useEffect(() => {
    localStorage.setItem('autoShowModal', String(autoShowModal));
  }, [autoShowModal]);

  // Salvar preferência de tema quando mudar
  useEffect(() => {
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  // Preparar dados para os componentes
  const askTheOracleCollection = currentRuleset.oracles 
    ? findAskTheOracleCollection(currentRuleset.oracles)
    : null;
  const askTheOracleTables = extractAskTheOracleTables(askTheOracleCollection);
  const otherOracles = currentRuleset.oracles 
    ? filterOtherOracles(currentRuleset.oracles)
    : [];

  // Salvar preferência quando mudar
  useEffect(() => {
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  return (
    <div className={`app-container ${gameMode === 'starforged' ? 'theme-starforged' : 'theme-ironsworn'} ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
      <Header
        gameMode={gameMode}
        setGameMode={setGameMode}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        isSmallScreen={isSmallScreen}
        logsCount={logs.length}
        onShowLogModal={() => setShowLogModal(!showLogModal)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <div className="oracle-container">
        <AskTheOracle
          tables={askTheOracleTables}
          onRoll={(name, table) => rollOracle(name, table)}
          allGroupsOpen={allGroupsOpen}
          onToggleAllGroups={handleToggleAllGroups}
        />

        <OracleNavigation
          oracles={otherOracles}
          rollOracle={rollOracle}
          findOracleById={findOracleById}
          rollMultipleOracles={rollMultipleOracles}
          allGroupsOpen={allGroupsOpen}
          selectedRegion={selectedRegion}
          gameMode={gameMode}
        />

        {!isSmallScreen && (
          <section className="log-section">
            <RollLog 
              logs={logs} 
              onRollAgain={handleRollAgain}
              findOracleById={findOracleById}
              onClearLog={handleClearLog}
              autoShowModal={autoShowModal}
              onToggleAutoShowModal={() => setAutoShowModal(!autoShowModal)}
            />
          </section>
        )}
      </div>

      <ResultModal
        log={logs[0]}
        isOpen={showResultModal && logs.length > 0}
        onClose={() => setShowResultModal(false)}
        onOracleClick={handleOracleClick}
        findOracleById={findOracleById}
      />

      <LogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        logs={logs}
        onRollAgain={handleRollAgain}
        findOracleById={findOracleById}
        onClearLog={handleClearLog}
        autoShowModal={autoShowModal}
        onToggleAutoShowModal={() => setAutoShowModal(!autoShowModal)}
      />
    </div>
  );
}

export default App;