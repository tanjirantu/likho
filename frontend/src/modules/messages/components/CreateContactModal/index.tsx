import React, { useState } from 'react';
import PhoneInput, { CountryData } from 'react-phone-input-2';
import Dialog from '../../../common/components/Dialog';

import 'react-phone-input-2/lib/style.css';
import useDebounce from '../../../common/hooks/useDebounce';
import { useGetUsersQuery } from '../../../../api/users';
import UserAvatar from '../../../common/components/UserAvatar';
import { createRoomMutation } from '../../../../api/messages';
import { useAppSelector } from '../../../common/hooks';

type PhoneInput = {
    phone: string;
    countryData: CountryData;
};

interface ICreateContactModal {
    onClose: () => void;
    isOpen: boolean;
}

const CreateContactModal: React.FC<ICreateContactModal> = ({
    isOpen,
    onClose,
}) => {
    const [contact, setContact] = useState<PhoneInput>({
        phone: '',
        countryData: {
            dialCode: '',
            countryCode: '',
            format: '',
            name: '',
        },
    });

    const { data: userData } = useAppSelector((state) => state.user);
    const value = useDebounce(contact.phone, 700);

    const number = value.replace(contact.countryData.dialCode, '');

    const { isFetching, data } = useGetUsersQuery(
        {
            params: {
                phone: value ? value : '',
            },
        },
        { skip: number === '' ? true : false }
    );

    const handleCreateRoom = async (uid: string) => {
        if (userData?.uid === undefined) return;
        try {
            const response = await createRoomMutation({
                label: uid,
                users: [uid],
            });

            if (response.statusCode === 200) {
                onClose();
            }
        } catch (error) {}
    };

    return (
        <Dialog
            className="max-w-xl rounded-md  p-5"
            open={isOpen}
            onClose={onClose}
        >
            <div>
                <div className="flex justify-between ">
                    <h3>Create Contact</h3>
                    <div
                        onClick={onClose}
                        className="cursor-pointer select-none  "
                    >
                        <img src="/static/assets/icons/clear.svg" alt="" />
                    </div>
                </div>

                <div>
                    <div className=" mb-2 mt-6">
                        <PhoneInput
                            inputStyle={{
                                border: 'none',
                                backgroundColor: '#F7F7F7',

                                padding: '25px 0px 25px 60px',
                                width: '100%',
                                boxShadow: '0 1px 0 0 #e8e8e8',
                            }}
                            buttonStyle={{
                                border: 'none',
                                width: '60px',
                            }}
                            country={'bd'}
                            value={contact.phone}
                            onChange={(phone, countryData: CountryData) =>
                                setContact({ phone, countryData })
                            }
                        />
                    </div>
                </div>

                {data?.result.users.length && isFetching !== true ? (
                    <h5 className="mb-2">Select Contact </h5>
                ) : null}

                <div>
                    {data?.result.users.map((user) => {
                        return (
                            <div
                                onClick={() => handleCreateRoom(user.uid)}
                                key={user.uid}
                                className="bg-gray-100 flex gap-3 hover:bg-opacity-100 items-center cursor-pointer select-none px-3 py-2 bg-opacity-60 rounded-md "
                            >
                                <UserAvatar
                                    height={35}
                                    width={35}
                                    src="/static/assets/images/avatar.png"
                                    name=""
                                />
                                <h4>{user.contact.phoneWithDialCode}</h4>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Dialog>
    );
};

export default CreateContactModal;
