import React from 'react';

const PrivacyContent: React.FC = () => {
    return (
        <div className="text-[#666] text-[16px] font-normal leading-[1.8] space-y-6 whitespace-pre-wrap">
            {/* Section 1 */}
            <div>
                <p className="font-bold text-[18px] text-[#333] mb-2">一、隱私權保護政策適用範圍</p>
                <p>{`本隱私政策說明當您使用我們的網站、手機應用程式或其他線上產品和服務（以下統稱為「本服務」），或者當您以其他方式與我們互動時，您的資訊將如何被收集並使用於拍揪有限公司以及其關係企業與產品。`}</p>
            </div>

            {/* Section 2 */}
            <div>
                <p className="font-bold text-[18px] text-[#333] mb-2">二、個人資料的蒐集、處理及利用方式</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>{`當您造訪本服務所提供之功能服務時，我們將視該服務功能性質，請您提供必要的個人資料，並在該特定目的範圍內處理及利用您的個人資料；非經您書面同意，本網站不會將個人資料用於其他用途。`}</li>
                    <li>{`當您使用本服務時，我們會蒐集您所輸入的資訊（例如：發佈活動、活動報名、使用留言、評論...等）。當您使用本服務時，我們可能會蒐集您的裝置資訊（例如：裝置型號、作業系統版本、裝置設定、唯一裝置識別碼以及行動網路資訊）。`}</li>
                </ul>
            </div>

            {/* Section 3 */}
            <div>
                <p className="font-bold text-[18px] text-[#333] mb-2">三、資料之保護</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>{`本網站主機均設有防火牆、防毒系統等相關的各項資訊安全設備及必要的安全防護措施，加以保護網站及您的個人資料採用嚴格的保護措施，只由經過授權的人員才能接觸您的個人資料，相關處理人員皆簽有保密合約，如有違反保密義務者，將會受到相關的法律處分。`}</li>
                    <li>{`如因業務需要有必要委託其他單位提供服務時，本網站亦會嚴格要求其遵守保密義務，並且採取必要檢查程序以確定其將確實遵守。`}</li>
                </ul>
            </div>

            {/* Section 4 */}
            <div>
                <p className="font-bold text-[18px] text-[#333] mb-2">四、網站對外的相關連結</p>
                <p>{`本網站的網頁提供其他網站的網路連結，您也可經由本網站所提供的連結，點選進入其他網站。但該連結網站不適用本網站的隱私權保護政策，您必須參考該連結網站中的隱私權保護政策。`}</p>
            </div>

            {/* Section 5 */}
            <div>
                <p className="font-bold text-[18px] text-[#333] mb-2">五、Cookie 之使用</p>
                <p>{`為了提供您最佳的服務，本網站會在您的電腦中放置並取用我們的 Cookie，若您不願接受 Cookie 的寫入，您可在您使用的瀏覽器功能項中設定隱私權等級為高，即可拒絕 Cookie 的寫入，但可能會導致網站某些功能無法正常執行。`}</p>
                <p>{`我們使用 Cookie 的目的，是為了識別您的瀏覽器與帳戶設定。本網站使用的 Cookie 包含以下資訊：用戶 ID、網頁瀏覽紀錄、上次訪問時間、以及您點擊的連結。`}</p>
            </div>

            {/* Section 6 */}
            <div>
                <p className="font-bold text-[18px] text-[#333] mb-2">六、隱私權保護政策之修正</p>
                <p>{`本網站隱私權保護政策將因應需求隨時進行修正，修正後的條款將刊登於網站上。`}</p>
            </div>

        </div>
    );
};

export default PrivacyContent;
