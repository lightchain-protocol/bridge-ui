
import { HistoryIcon, PlusIcon, useModal } from '@hyperlane-xyz/widgets';
import { config } from '../../consts/config';
import { useStore } from '../../features/store';
import { AddWarpConfigModal } from '../../features/warpCore/AddWarpConfigModal';
import { Color } from '../../styles/Color';

export function FloatingButtonStrip() {
  const { setIsSideBarOpen, isSideBarOpen } = useStore((s) => ({
    setIsSideBarOpen: s.setIsSideBarOpen,
    isSideBarOpen: s.isSideBarOpen,
  }));

  const {
    isOpen: isAddWarpConfigOpen,
    open: openAddWarpConfig,
    close: closeAddWarpConfig,
  } = useModal();

  return (
    <>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center gap-3 flex">
        <button
          className={`size-8 rounded-lg border border-dark-3 bg-black-colorful flex items-center justify-center transition-colors hover:bg-dark2`}
          onClick={() => setIsSideBarOpen(!isSideBarOpen)}
        >
          <HistoryIcon color="#7064e9" height={18} width={18} />
        </button>
        {config.showAddRouteButton && (
          <button
            className='size-8 rounded-lg border border-dark-3 bg-black-colorful flex items-center justify-center transition-colors hover:bg-dark2'
            onClick={openAddWarpConfig}
          >
            <PlusIcon color={Color.primary['900']} height={26} width={26} />
          </button>
        )}
      </div>
      <AddWarpConfigModal isOpen={isAddWarpConfigOpen} close={closeAddWarpConfig} />
    </>
  );
}
