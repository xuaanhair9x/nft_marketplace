import RowBasicNFT from "./RowBasicNFT"
import RowLendableNFT from "./RowLendableNFT"
import RowDynamicNFT from "./RowDynamicNFT";

export default function MyAccountPage(props) {
  return (
    <div className="flex justify-left">
      <RowBasicNFT {...props} />
      <RowLendableNFT {...props}/>
      <RowDynamicNFT {...props} />
    </div>
  );
}